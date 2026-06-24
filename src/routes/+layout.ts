import type {LayoutLoad} from "./$types";
import {initializePostHog} from "$lib/client/posthog";

export const load: LayoutLoad = () => {
    initializePostHog();
};
