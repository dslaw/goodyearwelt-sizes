// Model/view helper(s).

import { SizeRecord } from "../denormalize";
import { Grouping } from "./group";


export interface GroupDisplay {
  name: string;
  anchor: string;
  count: number;
  records: SizeRecord[];
}


export function makeAnchor(key: string): string {
  const formatted = key.trim().replace(/\s+/g, "-");
  return encodeURIComponent(formatted);
}

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

export class TablesPage<T> {
  private fileExt: string = ".html";
  public name: string;
  public title: string;
  public subtitle: string | null;
  public orderedGroups: Array<Grouping<T>>;

  constructor(
    name: string,
    title: string,
    subtitle: string | null,
    orderedGroups: Array<Grouping<T>>,
  ) {
    this.name = name;
    this.title = title;
    this.subtitle = subtitle;
    this.orderedGroups = orderedGroups;
  }

  public get filename(): string {
    const fname = `${this.name}${this.fileExt}`;
    return encodeURI(fname);
  }

  public get groups(): GroupDisplay[] {
    return this.orderedGroups.map(([ key, values ]) => ({
      name: key.toString(),
      anchor: makeAnchor(key.toString()),
      count: values.length,
      records: values,
    }));
  }
}

// https://github.com/Microsoft/TypeScript/issues/340#issuecomment-184964440
// tslint:disable-next-line
export interface SizeRecordDisplay extends SizeRecord { }
export class SizeRecordDisplay {
  constructor(sizeRecord: SizeRecord) {
    Object.assign(this, sizeRecord);
  }

  public get modelLast(): string {
    const lowered = this.mlast.toLowerCase();
    // Don't uppercase the possessive "s", e.g. "Nick's".
    const firstCharPattern = new RegExp(/\b(?<!')([a-z])/, "g");
    return lowered.replace(firstCharPattern, (group) => group.toUpperCase());
  }

  public get commentUrl(): string {
    const trailingSlashesPattern = /\/+$/;
    const threadUrl = this.threadUrl.replace(trailingSlashesPattern, "");
    return `${threadUrl}/${this.id}`;
  }

  public get tagSize(): string {
    return formatSize(this.size, this.width || "");
  }
}
