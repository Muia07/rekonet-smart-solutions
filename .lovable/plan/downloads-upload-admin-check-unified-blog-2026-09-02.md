# Downloads upload, admin check, unified blog

## 1. Why /admin/downloads has no link field

Confirmed in the code: the "App File *" section uses the blog upload widget, which only accepts image and video files (`image/jpeg`, `png`, `webp`, `gif`, `mp4`, `webm`, `ogg`) and always writes to the `blog-images` / `blog-videos` buckets. An APK or EXE is rejected, and there is no text field to paste a link to a file you already uploaded to the `app-downloads` bucket — so a manually uploaded APK cannot be attached to a download record.

Fix: rebuild that section with both paths you asked for.
- Upload: accepts `.apk`, `.exe`, `.zip`, `.msi` up to ~200 MB, uploads to the `app-downloads` bucket, then auto-fills file name, file size and the public URL.
- Paste link: a "File URL" field for files already in Supabase Storage, with the file name and size auto-derived (size editable), validated as a full `https://` link.
- Editing an existing record shows the current file and lets you replace it without retyping everything.
- Storage rules for `app-downloads` will be checked so an admin can actually upload (public read, admin-only write).

## 2. Admin pages verification

Sign in as the admin account and walk every admin page in a real browser, fixing what fails:
- `/auth` sign in and sign out
- `/admin/downloads`: create, edit, delete, activate/feature toggles, upload
- `/admin/blog`: create, edit, publish, image/video upload
- `/admin/users`: role listing
- `/admin/generate`
- A clear "You don't have admin access" state instead of a blank page for non-admins.

## 3. Why /blog feels like a different site

Confirmed: `/blog/` and each article are separate static HTML files that load `seo-pages.css` with their own simple header and footer, while the rest of the site is a single-page app on `rekonet.css`. Clicking Guides is a full page load into different styling, which is exactly the jarring change you noticed.

Fix: give the blog pages the same look and behaviour as the rest of the site — same navbar (with mobile menu), same footer, same colours, typography, buttons and WhatsApp button, plus internal links so moving between blog and app pages feels continuous. The pages stay static HTML (that is what makes them rank), they just stop looking foreign.

## 4. Blog source of truth: Supabase + static build

Chosen direction, and it is the right one: **write in Supabase, publish as static pages.**

- `/admin/blog` becomes the only place you author posts (rich text, images, videos, SEO fields).
- The build reads published rows from `blog_posts` and generates `/blog/<slug>/index.html` pages with full meta tags, `Article` schema and related links — same SEO strength as today.
- The 10 existing posts in `site-content.js` get imported into `blog_posts` once, so nothing is lost and there is a single source of truth afterwards.
- `sitemap.xml` is generated from the same data, so new posts are indexed automatically.
- The 3 posts already sitting in `blog_posts` get reviewed and either published or removed.
- Trade-off: a published post goes live on the next deploy, not instantly. Deploys are quick, and this keeps Google-friendly static HTML.

## Technical notes

- `src/js/rekonet.js` is a prebuilt, minified bundle (617 KB) with no React source in the repo. All app changes are surgical patches inside that bundle, verified in the browser after each change; no bundler rewrite as part of this work.
- Downloads upload needs a dedicated uploader (not the blog one) with a `app-downloads` bucket target and a larger size limit; storage policies via migration if writes are blocked.
- `scripts/generate-seo-pages.js` gains a Supabase fetch step for blog content; `scripts/content/site-content.js` keeps owning marketing/landing pages only.
- Blog templates in `generate-seo-pages.js` switch to the site header/footer markup and load `rekonet.css` tokens alongside `seo-pages.css`.
- Bump the service worker cache name so the changes appear without a hard refresh.
