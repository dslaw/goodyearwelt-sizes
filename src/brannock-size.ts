// Brannock size from a sizing thread.

import { Comment } from "./reddit";
import { formatSize } from "./render";


const SIZE_PATTERN = /([0-9]{1,2}(\.5)?)/i;
const WIDTH_PATTERN = /Narrow|Wide|[A-Z]{1,3}/i;
const COMMENT_PATTERN = new RegExp(`(${SIZE_PATTERN.source}\\s*(${WIDTH_PATTERN.source}))`, "i");


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
