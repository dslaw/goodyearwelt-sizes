// Brannock size from a sizing thread.

import { Comment } from "./reddit";


const SIZE_PATTERN = /([0-9]{1,2}(\.5)?)/i;
const WIDTH_PATTERN = /Narrow|Wide|[A-Z]{1,3}/i;
const COMMENT_PATTERN = new RegExp(`(${SIZE_PATTERN.source}\\s*(${WIDTH_PATTERN.source}))`, "i");

const WIDTH_ADJECTIVES = new Set([ "NARROW", "WIDE" ]);


export class BrannockSize {
  public size: number;
  public width: string;

  constructor(size: string | number, width: string) {
    this.size = parseFloat(size as string);
    this.width = width.toUpperCase();
  }

  // This gets used by e.g. `lodash.groupBy`.
  public toString(): string {
    if (WIDTH_ADJECTIVES.has(this.width)) {
      // Width is a word rather than a Brannock width,
      // so a space should be inserted between the numeric
      // size and the width, and be formatted nicely.
      const [ firstChar, ...rest ] = this.width.toLowerCase();
      const capitalized = firstChar.toUpperCase() + rest.join("");
      return `${this.size} ${capitalized}`;
    }

    return `${this.size}${this.width}`;
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
