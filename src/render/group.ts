// Organize sizing records for display.

import * as _ from "lodash";

import { BrannockSize } from "../brannock-size";
import { SizeRecord } from "../denormalize";
import { SizeRecordDisplay } from "./helpers";


export type Grouping<T> = [ T, SizeRecordDisplay[] ];


export function groupBrannockSizes(sizeRecords: SizeRecord[]): Array<Grouping<BrannockSize>> {
  const records = sizeRecords.map((r) => new SizeRecordDisplay(r));
  const grouped = _.groupBy(records, "brannockSize");
  const paired = _.entries(grouped)
    .map((kv: Grouping<string>): Grouping<BrannockSize> => {
      const [ brannockSizeText, values ] = kv;
      // Sort by secondary key within each group.
      const sorted: SizeRecordDisplay[] = _.sortBy(values, "modelLast");
      const brannockSize = BrannockSize.fromString(brannockSizeText);
      return [ brannockSize, sorted ];
    });

  // Sort by group.
  const sortedPairs = _.sortBy(paired, [
    (arr: Grouping<BrannockSize>) => arr[0].size,
    (arr: Grouping<BrannockSize>) => arr[0].width,
  ]);
  return sortedPairs;
}

export function groupMlasts(sizeRecords: SizeRecord[]): Array<Grouping<string>> {
  const records = sizeRecords.map((r) => new SizeRecordDisplay(r));
  const grouped = _.groupBy(records, "modelLast");
  const paired = _.entries(grouped)
    .map((kv: Grouping<string>): Grouping<string> => {
      const [ mlast, values ] = kv;
      // Sort by secondary key within each group.
      const sorted: SizeRecordDisplay[] = _.sortBy(values, [
        (record: SizeRecordDisplay) => record.brannockSize.size,
        (record: SizeRecordDisplay) => record.brannockSize.width,
      ]);
      return [ mlast, sorted ];
    });

  // Sort by group.
  const sortedPairs = _.sortBy(paired, _.first);
  return sortedPairs;
}
