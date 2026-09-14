# Inside GPT — Classroom Deployment

## Fastest Vercel deployment

1. Open Terminal in this folder.
2. Run:

   npx vercel --prod

3. Sign in to Vercel if prompted.
4. Choose your Vercel account/team.
5. Accept the detected static-site defaults.

Vercel will return a permanent HTTPS URL.

## What is included

- Responsive interactive learning site
- Progressive Web App manifest
- Service worker with offline cache after first successful visit
- Optimized WebP artwork
- App icon
- No student login or personal-data collection

## Classroom use

Share the final HTTPS URL or convert it into a QR code. Ask learners to open the site once while connected to the internet; after the first successful load, the service worker caches the site for offline/poor-network use.
