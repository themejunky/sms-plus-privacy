# chrisbarin.com SMS Plus privacy policy worker

Cloudflare Worker `smsplus-privacy-policy`, routes `chrisbarin.com/SMS-Plus-Privacy-Policy.html*` and `www.chrisbarin.com/SMS-Plus-Privacy-Policy.html*` (http and https, any query string).
It serves `SMS-Plus-Privacy-Policy.html` from this folder: the Android policy used by Google Play
("Themes for SMS" by TJ99), Samsung Galaxy Store and the Android app.

Deploy (from `keyboardplus-theme-platform/worker`, which has wrangler installed):

    PATH=/opt/homebrew/bin:$PATH node node_modules/wrangler/bin/wrangler.js deploy \
      --config "<this folder>/wrangler.toml"

Added 2026-11-08 after Play rejected 2.0.140 (271) for "Invalid Privacy policy: app or developer
details don't match". The origin file on the Romarg host is stale and masked by this worker.
To retire the worker: upload this HTML to `/public_html/SMS-Plus-Privacy-Policy.html`, then delete
the route and the worker.
