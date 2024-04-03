import type {PageServerLoad} from "./$types";

export const load: PageServerLoad = async ({url}) => {
    const domain = url.host
    return {
        boardId: generateRandomId(),
        domain: domain,
    };
};

function generateRandomId() {
    const randomLetters = Array.from({length: 10}, () =>
        String.fromCharCode(97 + Math.floor(Math.random() * 26)) // ASCII lowercase letters
    ).join('');

    // Insert dashes at specified positions
    return `${randomLetters.slice(0, 3)}-${randomLetters.slice(3, 7)}-${randomLetters.slice(7)}`;
}