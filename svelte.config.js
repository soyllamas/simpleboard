import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit: {
        adapter: adapter(),
        csp: {
            mode: "auto",
            directives: {
                "default-src": ["self"],
                "script-src": ["self"],
                "connect-src": [
                    "self",
                    "https://*.googleapis.com",
                    "https://*.firebaseio.com",
                    "wss://*.firebaseio.com",
                    "https://*.posthog.com",
                    "https://*.i.posthog.com"
                ],
                "img-src": ["self", "data:", "blob:", "https:"],
                "font-src": ["self", "data:"],
                "media-src": ["self", "data:", "blob:", "https:"],
                "worker-src": ["self", "blob:"],
                "object-src": ["none"],
                "base-uri": ["self"],
                "form-action": ["self"],
                "frame-ancestors": ["none"]
            }
        },
        experimental: {
            remoteFunctions: true
        }
    }
};

export default config;
