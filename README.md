# Larapel

Larapel turns browser-camera moments into small, shareable retro photobooth keepsakes with a note.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/larapel/src/` — React pages, shared UI, strip preview, canvas download composition, and QR rendering
- `artifacts/api-server/src/routes/strips.ts` — anonymous session strip API, note sanitization, and rate limiting
- `lib/api-spec/openapi.yaml` — source of truth for the strip API contract
- `lib/db/src/schema/strips.ts` — PostgreSQL schema for strip metadata and captured image data URLs
- `artifacts/larapel/src/index.css` — Larapel visual theme and motion utilities

## Architecture decisions

- Anonymous sessions use a long-lived httpOnly `larapel_session` cookie; no account flow is required for the MVP.
- Finished photos are stored as data URLs in PostgreSQL for the MVP to keep the capture/save path lean; the API exposes only unguessable strip IDs for sharing.
- The frontend derives the visible share URL from the current browser origin so QR codes and copy links work through the preview proxy and on a published domain.
- The client composes a downloadable PNG in the browser, while the server stores the original captured frames and note metadata.

## Product

- Landing page with Larapel branding and privacy note
- Mobile-first capture flow for 1–4 photos with retake/remove support
- Mono or sepia treatment, front/back note placement, and 180-character note limit
- Downloadable composed strip, native share/copy actions, and a real QR code
- Public share pages and anonymous session history

## User preferences

No additional preferences recorded.

## Gotchas

- After changing `lib/api-spec/openapi.yaml`, run `pnpm --filter @workspace/api-spec run codegen` before using generated hooks or Zod schemas.
- API routes are mounted under `/api`; the frontend uses generated hooks from `@workspace/api-client-react`.
- `Headers.entries()` in generated client code requires `dom.iterable` in the client library TypeScript `lib` list.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
