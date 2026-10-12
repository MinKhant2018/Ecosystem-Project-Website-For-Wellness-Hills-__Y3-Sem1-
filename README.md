# Wellness Hills Promotions

A React + Vite static website for the Promotions page at `/`, recreated from the five supplied screenshots. Includes six responsive partner cards, resort branding, contact bar, navigation, and ecosystem footer. No other pages are created.

## Develop and build

Requires Node.js 20.19+ or 22.12+ (tested with Node 24) and npm.

```sh
npm ci --cache /tmp/wellness-npm-cache
npm run dev
npm run build
npm run preview
```

Production files are generated in `dist/`. Serve them with a static web server; they do not require Node.js on the VPS. Fonts and images are bundled locally; no third-party CDN is required at runtime.

## Test

With the development server running:

```sh
npm test
```

Tests use Playwright and system Chromium (`/usr/bin/chromium`). Set `CHROMIUM_PATH` if your browser is elsewhere. Set `TEST_BASE_URL` to test the production preview server. Checks cover six cards, 3/2/1 grid columns, no horizontal overflow at 1480/1280/768/390/320px, image loading, runtime errors, inactive destinations, and the Google Form link's exact URL, security attributes, and new-tab behavior. The test intercepts Google Form navigation locally; it does not submit a form or validate Google's service. Screenshots go into ignored `test-results/`.

## References and assets

The supplied files are at the repository root: `promotions.png` and the four `Screenshot 2026-10-13 …` files. All five were inspected. The page is built from editable JSX and CSS, not displayed as one screenshot.

The six photos, six partner logos, and footer logo in `public/assets/` are cropped from the 2× `promotions.png` export and encoded as WebP. Standalone source assets, vector logos, and font specifications were not supplied. The crops therefore retain the raster resolution and any rounded corners/backgrounds baked into the export. Replace these files with original source assets when available. Open Sans and Georgia approximate the supplied sans-serif/body and serif/heading typography; exact Figma font metadata is unavailable.

Editable content/components: `src/main.jsx`. Responsive layout, colors, and spacing: `src/styles.css`.

## Missing URLs

Only Promotions (`/`) and “Submit video here” have active destinations. The latter opens the supplied Google Form in a new tab with `rel="noopener noreferrer"`.

Home, Stay, Wellness, Retreats, Pet Friendly, Facilities, Events, About, Contact, Check Live Rates & Book, language selection, partner Learn more/Visit website, footer Quick Links/Ecosystem/Policies, and social destinations were not supplied. They are retained visually without fabricated routes. Unknown link controls use `aria-disabled="true"` and do not navigate. Contact information is displayed exactly as provided in the screenshots. Supply verified URLs before making these controls active. The language badge displays EN; no translation service is implied.

## Deploy to Hostinger VPS with Nginx

No deployment or VPS changes have been performed. Use your actual domain, VPS account, and intended document root; back up your existing site and Nginx configuration first.

1. Run `npm ci` and `npm run build` locally or in CI.
2. Copy the **contents** of `dist/` into a dedicated document root on your VPS, such as `/var/www/wellness-hills`. Use a new release directory and switch the document root after validation if you need atomic deployment.
3. Adapt the following Nginx server block to your existing virtual host. Keep your current HTTPS/certificate configuration and unrelated sites intact.

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN;
    root /var/www/wellness-hills;
    index index.html;

    location = / {
        try_files /index.html =404;
    }
    location / {
        try_files $uri =404;
    }
    # Vite's hashed build assets can be cached for a year.
    location ~* ^/assets/.*-[A-Za-z0-9_-]+\.(js|css|woff2?)$ {
        try_files $uri =404;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    location = /index.html {
        add_header Cache-Control "no-cache";
    }
}
```

4. Check configuration with `sudo nginx -t`, then reload Nginx only after it passes.
5. Verify `/`, all six photos/logos, mobile layout, and the Google Form link over your actual HTTPS domain. Configure HTTPS through your existing certificate workflow before public use.

Do not copy `node_modules`, screenshot references, or source files into the public document root. Only `dist/` contents are needed. This site intentionally returns 404 for unspecified routes rather than creating additional pages.
