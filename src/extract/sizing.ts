// Size information matching, cleaning and validation.

import { postMatch, precedesMatch, SizeParts } from "./match";


export interface SizeInfo {
  size: number;
  width: string | null;
  intl: string | null;
}


// Run matching for sizing data on user-supplied text.
export function getMatches(text: string): { pre: SizeParts, post: SizeParts } {
  const post = postMatch(text);
  const pre = precedesMatch(text);
  return { post, pre };
}

// Determine if a shoe size is using the continental European convention.
export function isEU(size: number): boolean {
  // 33.5 is the smallest listed size in the Adults' shoe sizes
  // table given here: https://en.wikipedia.org/wiki/Shoe_size#Shoe_sizing
  return size >= 33.5;
}

// Use size to validate `intl`.
// This is primarily to determine a value in the event that
// `intl` is null.
//
// Size alone isn't enough to disambiguate US/UK, so this
// is limited to EU sizes.
export function reconcileIntl(sizeParts: SizeParts): string | null {
  const { intl } = sizeParts;
  const size = parseFloat(sizeParts.size || "");

  if (isEU(size) && sizeParts.intl !== "EU") {
    console.debug(`Expected "EU", instead got ${intl} for ${size}`);
    return "EU";
  }

  if (!isEU(size) && intl === "EU") {
    console.debug(`Expected "US" or "UK", instead got "${intl}" for ${size}`);
    return null;
  }

  return intl;
}

export function matchSizing(post: SizeParts, pre: SizeParts): SizeParts | null {
  // Check that the sizes match - if they don't, something has
  // gone very wrong.
  if (post.size !== pre.size) {
    console.error(
      "Expected sizes to match, ",
      `instead got "${post.size}" and "${pre.size}"`,
    );
    return null;
  }

  // Choose match which to use.
  // "post" is the first option, as it checks for the correct format.
  // "precedes" is used as a fallback iff it extracts _more_ data
  // than "post". Specifically, the intl convention, which is where
  // the functions differ in implementation.
  let sizing = post;
  if (post.intl === null && pre.intl !== null) {
    // `precedes` has more information, use it.
    console.debug(
      "Intl found using precedesMatch but not postMatch, ",
      "falling back to precedesMatch",
    );
    sizing = pre;
  }

  // Check that size is actually a number.
  // Given the regex used, `size` should always be numeric
  // or missing.
  const missingSize = isNaN(parseFloat(sizing.size || ""));
  if (missingSize) {
    // The size is the important piece of information - others just
    // add context.
    return null;
  }

  return sizing;
}

export function extractSizing(text: string): SizeInfo | null {
  const { post, pre } = getMatches(text);
  const sizeParts = matchSizing(post, pre);

  if (sizeParts === null) {
    return null;
  }

  const sizeInfo = {
    size: parseFloat(sizeParts.size || ""),
    width: sizeParts.width,
    intl: reconcileIntl(sizeParts),
  };
  return sizeInfo;
}
