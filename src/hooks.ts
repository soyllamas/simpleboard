import {redirect, type Handle} from '@sveltejs/kit';
import {sanitize} from "$lib/domain/useCase/sanitize";

export const handle: Handle = async ({event, resolve}) => {
    const slug = event.url.pathname;
    const isRoot = slug === "/";

    if (isRoot) return resolve(event);

    const sanitized = sanitize(event.url.pathname);
    const isNotSanitized = slug !== sanitized;

    if (isNotSanitized) {
        throw redirect(307, sanitized);
    }

    return resolve(event);
}
