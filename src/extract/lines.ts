// Find lines containing sizing information.

import * as _ from "lodash";
import removeMd = require("remove-markdown");


const SIZE_PAIR_DELIM = ":";


export interface SizingPair {
  shoeLast: string;
  sizingText: string;
}


export function normalizeMd(md: string): string[] {
  const text = _.unescape(md);
  const stripped = removeMd(text);
  return stripped
    .split("\n")
    // TODO: is a filter even necessary?
    .filter((line) => line.length)
    // Strip lead symbol from unordered list items that
    // don't have a space between the symbol and the text.
    // These lines won't be caught by `removeMd` as they
    // are improperly formatted, but are not a rare sight
    // on Reddit.
    .map((line) => line.replace(/^[-+*>]/g, ""))
    .map((line) => line.trim());
}

export function splitSizingPair(line: string): SizingPair | null {
  const parts = line.split(SIZE_PAIR_DELIM).map(_.trim);
  if (parts.length !== 2) {
    return null;
  }

  const [ shoeLast, sizingText ] = parts;
  return { shoeLast, sizingText };
}

export function getSizingPairs(md: string): SizingPair[] {
  const lines = normalizeMd(md);
  const sizingPairs = lines.map(splitSizingPair);
  return sizingPairs.filter((s): s is SizingPair => s !== null);
}
