# Larapel — Replit Build Prompt

Paste this into Replit's Agent / AI builder.

---

## App Overview
Build a web app called **Larapel** (from the Filipino words *Larawan* = photo and *Papel* = paper/note). It's a phone-friendly photobooth: users take a photo through their browser camera, add a short poem/note/word overlay on the photo (small text, placeable on front or back of the image), then download or share it via a QR code / shareable link.

Target users: general public — students, couples, friend groups, casual social sharing. Aesthetic: retro photobooth strip — black-and-white or sepia photo, bold film-strip border, red or black accent frame (see reference: red bordered 4-photo grid strip, and B&W 4x3 photo strip layout).

This is an MVP to validate the idea — keep it lean, avoid overbuilding.

## Tech Stack
- Frontend: React (Vite) — mobile-first, works great on Replit
- Backend: Node.js + Express
- Database: Replit DB or a simple SQLite/Postgres instance for storing photo metadata, notes, and user sessions
- Storage: store images as files (or base64 in DB for MVP simplicity) — no need for S3 at this stage
- QR codes: use the `qrcode` npm package to generate a QR pointing to a shareable download link
- Auth: skip full accounts for MVP — use anonymous sessions (a random session ID stored in a cookie) so users can revisit their own strips; add optional email/Google login only if time allows

## Core Features (MVP)
1. **Camera capture flow**
   - Access device camera via `getUserMedia`
   - Let user take 1–4 photos (photobooth-strip style, like the reference images)
   - Option to retake before finalizing

2. **Poem/Note overlay**
   - After capture, show a small text input ("Add a poem, note, or word")
   - Let user choose placement: front (overlaid on photo, small corner or bottom) or back (a second "page" shown after the photo, styled like the back of a Polaroid/photobooth strip)
   - Provide 2–3 preset short poem/quote snippets in Filipino and English as inspiration (user can also type their own)

3. **Strip generation**
   - Composite the photo(s) + overlay text into a single downloadable image (canvas-based rendering — use HTML5 Canvas or `html2canvas`)
   - Apply the branded frame (film-strip border, accent color)
   - Free tier: output includes a small "Larapel" watermark
   - Premium tier (stub only for MVP): toggle/paywall UI that would remove the watermark — actual payment integration can be a placeholder button for now ("Upgrade — coming soon") or wired to PayMongo/Stripe if time allows

4. **QR code + share link**
   - Generate a unique shareable URL for each finished strip
   - Generate a QR code linking to that URL, shown on a "Done" screen
   - Shareable page shows the strip image with a "Download" and "Make your own Larapel" call-to-action (this is your organic marketing loop — every shared strip promotes the app)

5. **Branding**
   - App name "Larapel" prominent on landing page with a one-line tagline (e.g., "Larawan. Papel. Isang alaala." / "Photo. Paper. One memory.")
   - Landing page: hero section with a sample strip, "Take your Larapel" primary button
   - Color palette: black/white photo tones + one bold accent (red or a warm sepia) — keep it simple and consistent with retro photobooth branding

## Security Basics (build in from the start)
- Do not make uploaded photo storage publicly listable — generate unguessable random IDs for each strip/session (not sequential numbers)
- Add basic rate-limiting on the capture/save endpoint to prevent spam/abuse
- Sanitize/limit the note text input (max length, strip HTML/script tags) before storing or rendering
- Add a simple privacy note on the landing page: photos are stored to generate your shareable link and are not used for anything else

## Nice-to-haves (only if time allows, not required for MVP)
- A gallery/history page for a user's own past strips (tied to their session cookie)
- A few filter options (B&W, sepia, vintage grain) applied via CSS/canvas filters
- Simple analytics counter (how many strips created) shown on the landing page for social proof

## Deliverable
A working Replit-hosted web app where a user can: land on the page → take a photo → add a short note/poem → get a branded photobooth strip → download it or get a QR code/link to share.
