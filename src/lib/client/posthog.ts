import {browser, dev} from "$app/environment";
import {env} from "$env/dynamic/public";
import posthog from "posthog-js";

let initialized = false;

export function initializePostHog() {
    if (!browser || initialized) return;

    const projectToken = env.PUBLIC_POSTHOG_PROJECT_TOKEN;
    if (!projectToken) return;

    posthog.init(projectToken, {
        api_host: env.PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
        capture_exceptions: {
            capture_console_errors: false,
            capture_unhandled_errors: true,
            capture_unhandled_rejections: true,
        },
        defaults: "2026-05-30",
        loaded: (client) => {
            if (dev) client.debug();
        },
    });

    initialized = true;
}

export function captureClientException(error: unknown, properties: Record<string, unknown>) {
    if (!browser || !initialized) return;

    try {
        posthog.captureException(error, properties);
    } catch (captureError) {
        console.error("Failed to capture client exception in PostHog", captureError);
    }
}
