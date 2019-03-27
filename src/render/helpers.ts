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
