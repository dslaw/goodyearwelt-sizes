// Organize sizing records for display.

import * as _ from "lodash";

import { BrannockSize } from "../brannock-size";
import { SizeRecord } from "../denormalize";


export type Grouping<T> = [ T, SizeRecord[] ];


export function groupBrannockSizes(sizeRecords: SizeRecord[]): Array<Grouping<BrannockSize>> {
  const grouped = _.groupBy(sizeRecords, "brannockSize");
  const paired = _.entries(grouped)
    .map((kv: Grouping<string>): Grouping<BrannockSize> => {
      const [ brannockSizeText, values ] = kv;
      // Sort by secondary key within each group.
      const sorted: SizeRecord[] = _.sortBy(values, "mlast");
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
  const grouped = _.groupBy(sizeRecords, "mlast");
  const paired = _.entries(grouped)
    .map((kv: Grouping<string>): Grouping<string> => {
      const [ mlast, values ] = kv;
      // Sort by secondary key within each group.
      const sorted: SizeRecord[] = _.sortBy(values, [
        (record: SizeRecord) => record.brannockSize.size,
        (record: SizeRecord) => record.brannockSize.width,
      ]);
      return [ mlast, sorted ];
    });

  // Sort by group.
  const sortedPairs = _.sortBy(paired, _.first);
  return sortedPairs;
}
