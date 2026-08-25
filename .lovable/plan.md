# Netlify Deployment Fix Plan

## Goal
Make the Rekonet Systems site deploy reliably on Netlify and load correctly after deployment, including direct links such as `/admin/blog`, `/downloads`, `/pricing`, and other pages.

## Confirmed problems from the current codebase
- `netlify.toml` publishes `dist`, but `package.json` currently has `npm run build` set to `echo 'Static site - no build required'`, so no `dist` folder is created for Netlify to publish.
- `index.html` loads `/src/main.tsx`, but `src/main.tsx` does not exist in the project snapshot. That will prevent the app from painting when served as-is.
- The project currently looks like a static HTML/CSS/JS deployment, not a complete Vite React source deployment: there is no `vite.config.ts`, no `src/App.tsx`, and no React dependencies in `package.json`.
- `public/_redirects` is missing, so Netlify deep links can still 404 if `netlify.toml` is ignored or overridden.
- `netlify.toml` still includes placeholder Supabase host values like `https://yoursite.supabase.co` in CSP/preconnect settings, which can block or misrepresent real Supabase traffic.

## Fix approach
Use the current project shape as the source of truth and make deployment consistent instead of mixing static and Vite settings.

### 1. Fix Netlify build output mismatch
- Change Netlify to publish the current static site root, or update the build script to create a proper deploy folder.
- Recommended: keep this as a static deployment for now because the React/Vite source files are not present.
- Set Netlify publish directory to `.` and keep the build command as a no-op/static validation command.

### 2. Fix the page entry script
- Update `index.html` so it loads the actual bundled JavaScript file that exists: `src/js/rekonet.js`.
- Ensure the stylesheet `src/css/rekonet.css` is linked correctly.
- Remove the missing `/src/main.tsx` reference so the deployed page can paint.

### 3. Add Netlify SPA fallback
- Add `public/_redirects` or a root `_redirects` file depending on the chosen publish directory.
- Include:
  ```text
  /* /index.html 200
  ```
- This makes direct visits to `/admin/blog`, `/downloads`, `/pricing`, etc. return the app shell instead of a Netlify 404.

### 4. Clean deployment/security headers
- Replace placeholder Supabase CSP entries with the actual connected Supabase project URL if the static site uses Supabase calls.
- If the current static bundle does not use Supabase directly, remove the placeholder domain from CSP/preconnect.
- Keep security headers, cache headers, and service worker settings compatible with the static deployment.

### 5. Verify locally before final answer
- Run the deploy-relevant check after edits: verify the site can be served and loaded from `/`, `/admin/blog`, `/downloads`, `/pricing`, `/contact`, and `/services`.
- Confirm no missing script/style errors in the browser console.
- Confirm Netlify config points to files that actually exist.

## Technical details
The current failure is not just a route issue. It is mainly a deployment configuration mismatch:

```text
Netlify publish = dist
npm run build = no output created
index.html script = /src/main.tsx
actual available JS = /src/js/rekonet.js
```

The implementation will align these pieces so Netlify publishes real files and the browser loads existing assets.
