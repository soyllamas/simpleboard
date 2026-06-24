import {env as privateEnv} from "$env/dynamic/private";
import {env as publicEnv} from "$env/dynamic/public";
import {redirect, type Handle, type HandleServerError} from "@sveltejs/kit";
import {sequence} from "@sveltejs/kit/hooks";
import {createPostHogDrain} from "evlog/posthog";
import {createEvlogHooks} from "evlog/sveltekit";
import {sanitize} from "$lib/domain/useCase/sanitize";
import {captureServerException} from "$lib/server/posthog";

const posthogHost = privateEnv.POSTHOG_HOST || "https://us.i.posthog.com";

const evlogHooks = createEvlogHooks({
    drain: privateEnv.POSTHOG_API_KEY
        ? createPostHogDrain({
            apiKey: privateEnv.POSTHOG_API_KEY,
            host: posthogHost,
        })
        : undefined,
    redact: true,
});

const securityHeaders: Handle = async ({event, resolve}) => {
    const response = await resolve(event);
    const cspReportUrl = getCspReportUrl();

    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set(
        "Permissions-Policy",
        "camera=(), geolocation=(), microphone=(), payment=(), usb=()"
    );

    if (cspReportUrl) {
        const contentSecurityPolicy = response.headers.get("Content-Security-Policy");

        response.headers.set("Reporting-Endpoints", `posthog="${cspReportUrl}"`);

        if (contentSecurityPolicy) {
            response.headers.set(
                "Content-Security-Policy",
                `${contentSecurityPolicy}; report-uri ${cspReportUrl}; report-to posthog`
            );
        }
    }

    return response;
};

function getCspReportUrl() {
    const projectToken = publicEnv.PUBLIC_POSTHOG_PROJECT_TOKEN;
    if (!projectToken) return;

    const url = new URL("/report/", publicEnv.PUBLIC_POSTHOG_HOST || posthogHost);
    url.searchParams.set("token", projectToken);

    const version = privateEnv.POSTHOG_CSP_VERSION || "1";
    if (version) url.searchParams.set("v", version);

    return url.toString();
}

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

export const handle = sequence(evlogHooks.handle as Handle, sanitizePath, securityHeaders);

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
