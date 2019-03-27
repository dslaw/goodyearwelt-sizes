// Brannock size from a sizing thread.

import { Comment } from "./reddit";


const SIZE_PATTERN = /([0-9]{1,2}(\.5)?)/i;
const WIDTH_PATTERN = /Narrow|Wide|[A-Z]{1,3}/i;
const COMMENT_PATTERN = new RegExp(`(${SIZE_PATTERN.source}\\s*(${WIDTH_PATTERN.source}))`, "i");

const WIDTH_ADJECTIVES = new Set([ "NARROW", "WIDE" ]);


export function formatSize(size: number, width: string): string {
  // NB: width adjectives are only expected to occur for the sizing
  //     thread Brannock sizes - they're not used by the device.
  const widthUpperCased = width.toUpperCase();
  if (WIDTH_ADJECTIVES.has(widthUpperCased)) {
    // Width is a word rather than a Brannock width,
    // so a space should be inserted between the numeric
    // size and the width, and be formatted nicely.
    const [ firstChar, ...rest ] = width.toLowerCase();
    const capitalized = firstChar.toUpperCase() + rest.join("");
    return `${size} ${capitalized}`;
  }

  return `${size}${widthUpperCased}`;
}

export class BrannockSize {
  public size: number;
  public width: string;

  constructor(size: string | number, width: string) {
    this.size = parseFloat(size as string);
    this.width = width.toUpperCase();
  }

  public toString(): string {
    return formatSize(this.size, this.width);
  }

  public static fromString(s: string): BrannockSize {
    const inputString = s.trim();
    const match = SIZE_PATTERN.exec(inputString);
    if (match === null) {
      throw new Error("No Brannock size found");
    }

    const [ matchVal ] = match;
    const width = inputString.replace(matchVal, "").trim();
    return new this(matchVal, width);
  }

  public static fromComment(comment: Comment): BrannockSize {
    const md = comment.body;
    if (md === null) {
      throw new Error("Comment must have a body");
    }

    const match = COMMENT_PATTERN.exec(md);
    if (match === null) {
      throw new Error("No Brannock size found");
    }

    const [ matchVal ] = match;
    return this.fromString(matchVal);
  }
}
