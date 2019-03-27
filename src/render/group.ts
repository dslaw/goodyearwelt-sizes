// Organize sizing records for display.

import * as _ from "lodash";

import { BrannockSize } from "../brannock-size";
import { SizeRecordWithMetadata } from "../denormalize";


export type Grouping<T> = [ T, SizeRecordWithMetadata[] ];


export function groupBrannockSizes(sizeRecords: SizeRecordWithMetadata[]): Array<Grouping<BrannockSize>> {
  const grouped = _.groupBy(sizeRecords, "brannockSize");
  const paired = _.entries(grouped)
    .map((kv: Grouping<string>): Grouping<BrannockSize> => {
      const [ brannockSizeText, values ] = kv;
      // Sort by secondary key within each group.
      const sorted: SizeRecordWithMetadata[] = _.sortBy(values, "mlast");
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

export function groupMlasts(sizeRecords: SizeRecordWithMetadata[]): Array<Grouping<string>> {
  const grouped = _.groupBy(sizeRecords, "mlast");
  const paired = _.entries(grouped)
    .map((kv: Grouping<string>): Grouping<string> => {
      const [ mlast, values ] = kv;
      // Sort by secondary key within each group.
      const sorted: SizeRecordWithMetadata[] = _.sortBy(values, [
        (record: SizeRecordWithMetadata) => record.brannockSize.size,
        (record: SizeRecordWithMetadata) => record.brannockSize.width,
      ]);
      return [ mlast, sorted ];
    });

  // Sort by group.
  const sortedPairs = _.sortBy(paired, _.first);
  return sortedPairs;
}
