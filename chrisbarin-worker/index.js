// Serves the Android privacy policy for SMS Plus ("Themes for SMS") at
// https://chrisbarin.com/SMS-Plus-Privacy-Policy.html, the URL declared in Play Console,
// the Samsung Galaxy Store listing and the Android app.
// Source of truth: ./SMS-Plus-Privacy-Policy.html (bundled as a Text module).
// It masks the origin copy on the Romarg host, which could not be updated over FTPS on 2026-11-08.
import POLICY_HTML from "./SMS-Plus-Privacy-Policy.html";

export default {
  async fetch(request) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
    }
    return new Response(request.method === "HEAD" ? null : POLICY_HTML, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=300",
      },
    });
  },
};
