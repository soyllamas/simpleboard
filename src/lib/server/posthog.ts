import {env} from "$env/dynamic/private";
import {PostHog} from "posthog-node";

export async function captureServerException(error: unknown, properties: Record<string, unknown>) {
    const apiKey = env.POSTHOG_API_KEY;
    if (!apiKey) return;

    const posthog = new PostHog(apiKey, {
        flushAt: 1,
        flushInterval: 0,
        host: env.POSTHOG_HOST || "https://us.i.posthog.com",
    });

    try {
        await posthog.captureExceptionImmediate(error, undefined, properties);
    } finally {
        await posthog.shutdown();
    }
}
