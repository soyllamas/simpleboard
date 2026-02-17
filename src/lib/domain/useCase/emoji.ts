import { EMOJI_LIST, EMOJI_MAP, type EmojiEntry } from "$lib/data/emoji-shortcodes";

export type TriggerState = {
	active: boolean;
	query: string;
	/** Character offset of the `:` trigger within the text */
	triggerOffset: number;
	/** Character offset of the cursor */
	cursorOffset: number;
};

const INACTIVE: TriggerState = { active: false, query: "", triggerOffset: -1, cursorOffset: -1 };

/**
 * Gets the text before the cursor as an innerText-compatible string.
 * Walks DOM child nodes, counting BRs as \n (unlike Range.toString() which skips them).
 * Returns null if cursor is not inside the element.
 */
function getTextBeforeCursor(element: HTMLElement): string | null {
	const selection = window.getSelection();
	if (!selection || selection.rangeCount === 0) return null;

	const range = selection.getRangeAt(0);
	if (!element.contains(range.startContainer)) return null;

	let text = "";
	for (const child of element.childNodes) {
		if (child === range.startContainer) {
			text += (child.textContent ?? "").slice(0, range.startOffset);
			return text;
		}
		if (child.nodeType === Node.TEXT_NODE) {
			text += child.textContent ?? "";
		} else if (child.nodeName === "BR") {
			text += "\n";
		}
	}

	// Cursor might be at element level (e.g., after all children)
	if (range.startContainer === element) {
		let i = 0;
		for (const child of element.childNodes) {
			if (i >= range.startOffset) break;
			if (child.nodeType === Node.TEXT_NODE) {
				text += child.textContent ?? "";
			} else if (child.nodeName === "BR") {
				text += "\n";
			}
			i++;
		}
		return text;
	}

	return null;
}

/**
 * Detects whether the user is typing an emoji shortcode.
 * Looks for an unmatched `:` before the cursor preceded by whitespace or at position 0.
 * Returns the query text between `:` and cursor (e.g., typing `:smi` returns query "smi").
 * Offsets are innerText-compatible (BRs count as \n).
 */
export function detectTrigger(element: HTMLElement): TriggerState {
	const textBeforeCursor = getTextBeforeCursor(element);
	if (textBeforeCursor === null) return INACTIVE;

	const lastColon = textBeforeCursor.lastIndexOf(":");
	if (lastColon === -1) return INACTIVE;

	// `:` must be at start or preceded by whitespace
	if (lastColon > 0 && !/\s/.test(textBeforeCursor[lastColon - 1])) return INACTIVE;

	const query = textBeforeCursor.slice(lastColon + 1);

	// Abandoned if query contains whitespace
	if (/\s/.test(query)) return INACTIVE;

	// Need at least 1 character after `:`
	if (query.length === 0) return INACTIVE;

	return {
		active: true,
		query,
		triggerOffset: lastColon,
		cursorOffset: textBeforeCursor.length,
	};
}

/**
 * Detects if the user just typed a closing `:` completing an exact shortcode.
 * e.g., `:sparkles:` → returns the emoji and offsets for replacement.
 * Offsets are innerText-compatible (BRs count as \n).
 */
export function detectExactMatch(
	element: HTMLElement,
): { emoji: string; triggerOffset: number; cursorOffset: number } | null {
	const textBeforeCursor = getTextBeforeCursor(element);
	if (textBeforeCursor === null) return null;

	// Must end with `:`
	if (!textBeforeCursor.endsWith(":")) return null;

	// Find the opening `:` — look for the second-to-last `:`
	const withoutClosing = textBeforeCursor.slice(0, -1);
	const openColon = withoutClosing.lastIndexOf(":");
	if (openColon === -1) return null;

	// Opening `:` must be at start or preceded by whitespace
	if (openColon > 0 && !/\s/.test(withoutClosing[openColon - 1])) return null;

	const shortcode = withoutClosing.slice(openColon + 1);

	// No whitespace in shortcode
	if (/\s/.test(shortcode) || shortcode.length === 0) return null;

	const emoji = EMOJI_MAP[shortcode];
	if (!emoji) return null;

	return {
		emoji,
		triggerOffset: openColon,
		cursorOffset: textBeforeCursor.length,
	};
}

/**
 * Filters emoji list by prefix match on shortcode.
 * Returns at most `limit` results.
 */
export function searchEmojis(query: string, limit: number = 8): EmojiEntry[] {
	const lowerQuery = query.toLowerCase();
	return EMOJI_LIST.filter((entry) => entry.shortcode.startsWith(lowerQuery)).slice(0, limit);
}

/**
 * Resolves a character offset (relative to innerText) to a DOM node + offset pair.
 * Walks child nodes accounting for text nodes and BR elements (which represent \n).
 * Returns null if the offset can't be resolved.
 */
export function resolveNodeOffset(
	element: HTMLElement,
	charOffset: number,
): { node: Node; offset: number } | null {
	let remaining = charOffset;

	for (const child of element.childNodes) {
		if (child.nodeType === Node.TEXT_NODE) {
			const len = child.textContent?.length ?? 0;
			if (remaining <= len) {
				return { node: child, offset: remaining };
			}
			remaining -= len;
		} else if (child.nodeName === "BR") {
			// BR counts as 1 character (\n) in innerText
			if (remaining === 0) {
				// Offset points to just before this BR — place cursor at end of previous text node
				const prev = child.previousSibling;
				if (prev && prev.nodeType === Node.TEXT_NODE) {
					return { node: prev, offset: prev.textContent?.length ?? 0 };
				}
				return { node: element, offset: Array.from(element.childNodes).indexOf(child as ChildNode) };
			}
			remaining -= 1;
		}
	}

	// Offset is at the very end
	const lastChild = element.lastChild;
	if (lastChild && lastChild.nodeType === Node.TEXT_NODE) {
		return { node: lastChild, offset: lastChild.textContent?.length ?? 0 };
	}

	return null;
}
