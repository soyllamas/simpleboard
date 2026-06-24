import type {HandleClientError} from "@sveltejs/kit";
import {captureClientException} from "$lib/client/posthog";

export const handleError: HandleClientError = ({error, status, message}) => {
    const errorId = crypto.randomUUID();

    if (status !== 404) {
        captureClientException(error, {
            error_id: errorId,
            status,
        });
    }

    return {
        message,
        errorId,
    };
};
