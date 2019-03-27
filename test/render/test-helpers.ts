import { assert } from "chai";

import { SizeRecordWithMetadata } from "../../src/denormalize";
import { Grouping } from "../../src/render";
import { makeAnchor, TablesPage } from "../../src/render/helpers";


describe("Make anchor link", () => {
  it("Should trim whitespace", () => {
    const key = " hello ";
    const expected = "hello";
    assert.strictEqual(makeAnchor(key), expected);
  });

  it("Should collapse and replace inner whitespace", () => {
    const key = "hello there";
    const expected = "hello-there";
    assert.strictEqual(makeAnchor(key), expected);
  });
});

describe("Tables page helper", () => {
  it("Should return a html filename", () => {
    const helper = new TablesPage<string>("name", "title", null, []);
    const expected = "name.html";
    assert.propertyVal(helper, "filename", expected);
  });

  it("Should make group aggregates", () => {
    const sizeRecords = [
      { size: 9.5, width: "D", intl: null, mlast: "Alden", sizingText: "9.5D" },
      { size: 10, width: "D", intl: null, mlast: "Alden", sizingText: "10D" },
    ] as SizeRecordWithMetadata[];
    const grouping: Grouping<string> = [ "Alden", sizeRecords ];
    const expected = [{
      name: "Alden",
      anchor: "Alden",
      count: 2,
      records: sizeRecords,
    }];
    const helper = new TablesPage<string>("name", "title", null, [ grouping ]);

    assert.deepStrictEqual(helper.groups, expected);
  });
});
