# Inside GPT — How GPT Learns

An interactive, visual, self-guided story explaining how Generative Pre-trained Transformers (GPTs) work under the hood, designed for classroom learning and self-paced exploration.

🌐 **Live Deployment**: [https://inside-gpt-learning.vercel.app](https://inside-gpt-learning.vercel.app)

## Features

- **Interactive Visual Story**: Breaks down tokenization, embeddings, self-attention, and language prediction with engaging interactive widgets.
- **Progressive Web App (PWA)**: Installable on desktop and mobile devices for standalone classroom use.
- **Offline Ready**: Service worker caches all assets on first load, allowing use even in low-bandwidth or offline environments.
- **Zero External Dependencies**: Pure vanilla HTML, CSS, and modern JavaScript for maximum speed and simplicity.
- **Privacy-First**: No learner login, trackers, or data collection.

## Project Structure

- `index.html` — The core interactive visual experience and styles.
- `sw.js` — Service worker for offline caching.
- `manifest.webmanifest` — Web App Manifest for PWA installation.
- `art-1.webp` – `art-4.webp` — Optimized visual story assets.
- `icon.svg` — Application icon.
- `vercel.json` — Static hosting configuration and cache headers.

## Deployment

Continuous deployment is configured via Vercel. Commits pushed to the `main` branch are automatically deployed to production.
