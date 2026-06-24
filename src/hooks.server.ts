import {env} from "$env/dynamic/private";
import {redirect, type Handle, type HandleServerError} from "@sveltejs/kit";
import {sequence} from "@sveltejs/kit/hooks";
import {createPostHogDrain} from "evlog/posthog";
import {createEvlogHooks} from "evlog/sveltekit";
import {sanitize} from "$lib/domain/useCase/sanitize";
import {captureServerException} from "$lib/server/posthog";

const posthogHost = env.POSTHOG_HOST || "https://us.i.posthog.com";

const evlogHooks = createEvlogHooks({
    drain: env.POSTHOG_API_KEY
        ? createPostHogDrain({
            apiKey: env.POSTHOG_API_KEY,
            host: posthogHost,
        })
        : undefined,
    redact: true,
});

const sanitizePath: Handle = async ({event, resolve}) => {
    const slug = event.url.pathname;
    const isRoot = slug === "/";

    if (isRoot) return resolve(event);

    const sanitized = sanitize(event.url.pathname);
    const isNotSanitized = slug !== sanitized;

    if (isNotSanitized) {
        throw redirect(307, sanitized);
    }

    return resolve(event);
};

export const handle = sequence(evlogHooks.handle as Handle, sanitizePath);

export const handleError: HandleServerError = async (input) => {
    const errorId = crypto.randomUUID();

    if (input.status !== 404) {
        try {
            await captureServerException(input.error, {
                error_id: errorId,
                method: input.event.request.method,
                path: input.event.url.pathname,
                status: input.status,
            });
        } catch (error) {
            console.error("Failed to capture server exception in PostHog", error);
        }
    }

    try {
        const evlogError = await evlogHooks.handleError(input);

        return {
            ...evlogError,
            message: evlogError?.message ?? input.message,
            errorId,
        };
    } catch (error) {
        console.error("Failed to log server error with evlog", error);
    }

    return {
        message: input.message,
        errorId,
    };
};
