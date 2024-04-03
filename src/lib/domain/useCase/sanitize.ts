// Used to sanitize a url.
export function sanitize(inputString: string) {
    // Step 1: Normalize string to decompose accents, then remove diacritics
    let cleanString = inputString.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Step 2: Split by "/" and take the first part
    cleanString = cleanString.split("/").join("");

    // Step 3: Convert to lowercase
    cleanString = cleanString.toLowerCase();

    // Step 4: Replace one or more spaces with a single dash "-" and remove non-alphanumeric characters
    // This regex also removes any characters that aren't letters, numbers, or dashes
    return `/${cleanString.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
}
