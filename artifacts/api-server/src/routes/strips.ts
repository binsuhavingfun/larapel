import { randomBytes, randomUUID } from "node:crypto";
import { Router, type IRouter, type Request, type Response } from "express";
import { desc, eq } from "drizzle-orm";
import { db, stripsTable, type Strip } from "@workspace/db";
import {
  CreateStripBody,
  CreateStripResponse,
  GetStripParams,
  GetStripResponse,
  ListStripsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();
const SESSION_COOKIE = "larapel_session";
const RATE_WINDOW_MS = 10 * 60 * 1000;
const MAX_STRIPS_PER_WINDOW = 8;
const recentCreations = new Map<string, number[]>();

function getSessionId(req: Request, res: Response): string {
  const existing = req.cookies?.[SESSION_COOKIE];
  if (typeof existing === "string" && existing.length >= 16) {
    return existing;
  }

  const sessionId = randomUUID();
  res.cookie(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });
  return sessionId;
}

function sanitizeNote(note: string): string {
  return note
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

function isAllowedPhoto(photo: string): boolean {
  return /^data:image\/(jpeg|jpg|png|webp);base64,[a-z0-9+/=\s]+$/i.test(photo);
}

function isRateLimited(sessionId: string): boolean {
  const now = Date.now();
  const timestamps = (recentCreations.get(sessionId) ?? []).filter(
    (timestamp) => now - timestamp < RATE_WINDOW_MS,
  );
  if (timestamps.length >= MAX_STRIPS_PER_WINDOW) {
    recentCreations.set(sessionId, timestamps);
    return true;
  }
  timestamps.push(now);
  recentCreations.set(sessionId, timestamps);
  return false;
}

function toSummary(strip: Strip) {
  return {
    id: strip.id,
    createdAt: strip.createdAt.toISOString(),
    photoCount: strip.photos.length,
    note: strip.note,
    placement: strip.placement as "front" | "back",
    filter: strip.filter as "mono" | "sepia",
  };
}

function toStrip(strip: Strip, req: Request) {
  return {
    ...toSummary(strip),
    photos: strip.photos,
    shareUrl: `${req.protocol}://${req.get("host")}/share/${strip.id}`,
  };
}

router.get("/strips", async (req, res): Promise<void> => {
  const sessionId = getSessionId(req, res);
  const strips = await db
    .select()
    .from(stripsTable)
    .where(eq(stripsTable.sessionId, sessionId))
    .orderBy(desc(stripsTable.createdAt))
    .limit(20);

  res.json(ListStripsResponse.parse(strips.map(toSummary)));
});

router.post("/strips", async (req, res): Promise<void> => {
  const sessionId = getSessionId(req, res);
  if (isRateLimited(sessionId)) {
    res.status(429).json({ error: "Please wait a moment before creating another strip." });
    return;
  }

  const parsed = CreateStripBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.flatten() }, "Invalid strip payload");
    res.status(400).json({ error: "Please check your photos and note, then try again." });
    return;
  }

  const { photos, placement, filter } = parsed.data;
  if (!photos.every(isAllowedPhoto)) {
    res.status(400).json({ error: "Only captured image files are allowed." });
    return;
  }

  const id = randomBytes(18).toString("base64url");
  const [strip] = await db
    .insert(stripsTable)
    .values({
      id,
      sessionId,
      photos,
      note: sanitizeNote(parsed.data.note),
      placement,
      filter,
    })
    .returning();

  res.status(201).json(CreateStripResponse.parse(toStrip(strip, req)));
});

router.get("/strips/:id", async (req, res): Promise<void> => {
  const params = GetStripParams.safeParse(req.params);
  if (!params.success) {
    res.status(404).json({ error: "Strip not found." });
    return;
  }

  const [strip] = await db
    .select()
    .from(stripsTable)
    .where(eq(stripsTable.id, params.data.id))
    .limit(1);

  if (!strip) {
    res.status(404).json({ error: "Strip not found." });
    return;
  }

  res.json(GetStripResponse.parse(toStrip(strip, req)));
});

export default router;