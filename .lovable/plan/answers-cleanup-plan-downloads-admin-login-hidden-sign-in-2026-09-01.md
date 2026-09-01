# Answers + Cleanup Plan: Downloads, Admin Login, Hidden Sign In

## 1. Why the APK download 404s

Verified in the database and storage:

- Storage bucket `app-downloads` (public) contains only **one** real file: `OpenPOS-Setup.exe` (25.4 MB).
- The `app_downloads` table has three rows:
  - `Rekonet POS System` -> `file_url = /Rekonet_v1.0.apk` (a site-root path; **no such file exists** in the project or in storage) -> this is the 404.
  - `OpenPOS` -> correct public storage URL (works).
  - A second, duplicate `OpenPOS` row with an empty `file_url` (inactive, but clutter).

So: there is **no APK in Supabase at all**. APKs must be uploaded to Storage > `app-downloads` bucket, then the row's `file_url` set to the public URL
`https://aiqodirqebqptnycmgwt.supabase.co/storage/v1/object/public/app-downloads/<file-name>`.

## 2. How admin login works today

- Sign-in page is at `/auth` (email + password, Supabase `signInWithPassword`).
- Admin routes: `/admin/blog`, `/admin/downloads`, `/admin/users`, `/admin/generate`, gated by the `admin` role in `public.user_roles` via `has_role()`.
- Verified: there is **one** auth user (`evan.mwangi@outlook.com`) and **zero** rows in `user_roles` — so nobody can currently open any admin page even after logging in.

## 3. Hiding "Sign In" from the public

Admin access stays fully functional, just not advertised.

## Work to do

### A. Fix downloads
1. Deactivate/remove the broken `Rekonet POS System` row (or keep it hidden until a real APK exists) and delete the duplicate empty `OpenPOS` row.
2. Add validation on the downloads page: if a record's `file_url` is empty or not an absolute URL, hide the Download button and show "Coming soon" instead of producing a 404.
3. In `/admin/downloads`, require a full storage URL (or upload the file directly to the `app-downloads` bucket from the form) so this cannot happen again.

### B. Enable admin login
4. Grant the `admin` role to `evan.mwangi@outlook.com` (insert into `user_roles`), so admin pages open after signing in at `/auth`.
5. Show a clear "You don't have admin access" message instead of a blank page when a signed-in non-admin hits `/admin/*`.

### C. Hide Sign In
6. Remove the "Sign In" link from the public navbar and footer (desktop + mobile). Keep `/auth` reachable by direct URL, plus a discreet footer dot/keyboard path if wanted.
7. When signed in as admin, the navbar shows an "Admin" link and "Sign Out" instead.
8. Keep `Disallow: /admin/` and add `Disallow: /auth` in robots.txt so the login page is not indexed.

### D. Ten further improvements
9. Email notification on new quote request (edge function + Resend) so leads don't require checking Supabase.
10. Admin "Leads" dashboard: view/filter `quote_requests`, mark status (new/contacted/won), export CSV.
11. Download counter actually increments on click (currently every app shows 0 downloads).
12. WhatsApp click-to-chat floating button (+254 745 522 104) — highest-converting channel in Kenya.
13. Testimonials/case studies section with real client quotes + `Review` schema (needs 3-5 from you).
14. Blog images: automatic WebP conversion and width limits on upload; add `Article` schema per post and related-post links.
15. Google Business Profile + local citations (Yellow Pages Kenya, BizPages) and an FAQ schema block on the pricing page.
16. Analytics: Google Analytics 4 or Plausible plus Search Console sitemap ping, so we can see which SEO pages convert.
17. Sitemap generated from the database (blog posts and downloads auto-included) instead of a hand-maintained list.
18. Trust and hygiene pass: `SECURITY.md`-level checks on storage buckets (make `blog-videos` limits explicit), file-size/type limits on uploads, and a 404 page with helpful links.

## Technical notes
- Role changes and row cleanup go through database migrations / SQL, not client code.
- Downloads page and navbar logic live in the bundled `src/js/rekonet.js`; static SEO pages under `public/` share the footer markup and need the same Sign In removal.
