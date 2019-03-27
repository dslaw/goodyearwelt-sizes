import { assert } from "chai";

import { BrannockSize } from "../../src/brannock-size";
import { SizeRecord } from "../../src/denormalize";
import { Grouping } from "../../src/render";
import {
  formatSize,
  makeAnchor,
  SizeRecordDisplay,
  TablesPage,
} from "../../src/render/helpers";


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

describe("Cast a full size to a string", () => {
  const sizeExpected = [
    { str: "8D", size: 8, width: "D" },
    { str: "8.5D", size: 8.5, width: "D" },
    { str: "10D", size: 10, width: "D" },
    { str: "10.5D", size: 10.5, width: "D" },
    { str: "8D", size: 8, width: "d" },
  ];
  sizeExpected.forEach((obj: any) => {
    it(`Should format ${obj.size} ${obj.width}`, () => {
      const out = formatSize(obj.size, obj.width);
      assert.strictEqual(out, obj.str);
    });
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
    ] as SizeRecord[];
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

describe("Size record helper", () => {
  it("Should copy all size record properties", () => {
    const sizeRecord = {
      size: 9,
      width: "D",
      intl: null,
      mlast: "mlast",
      id: "id",
      sizingText: "sizingText",
      parentId: "parentId",
      brannockSize: new BrannockSize(8, "D"),
      threadId: "threadId",
      threadUrl: "threadUrl",
    };
    const helper = new SizeRecordDisplay(sizeRecord);
    assert.hasAllKeys(helper, sizeRecord);
  });

  const mlastExpected = [
    { expected: "Alden", mlast: "alden" },
    { expected: "Alden Trubalance", mlast: "alden trubalance" },
    { expected: "Alden", mlast: "ALDEN" },
    { expected: "A.E. Higgins", mlast: "a.e. higgins" },
    // Don't uppercase character after apostraphe.
    { expected: "White's Bounty", mlast: "White's Bounty" },
  ];
  mlastExpected.forEach((obj: any) => {
    it(`Should properly case mlast "${obj.mlast}"`, () => {
      const helper = new SizeRecordDisplay({ mlast: obj.mlast } as SizeRecord);
      assert.propertyVal(helper, "modelLast", obj.expected);
    });
  });

  const urlExpected = [
    { expected: "http://reddit.com/r/foo/commentId", threadUrl: "http://reddit.com/r/foo/" },
    { expected: "http://reddit.com/r/foo/commentId", threadUrl: "http://reddit.com/r/foo//" },
    { expected: "http://reddit.com/r/foo/commentId", threadUrl: "http://reddit.com/r/foo" },
  ];
  urlExpected.forEach((obj: any) => {
    it(`Should create the comment URL from "${obj.threadUrl}"`, () => {
      const helper = new SizeRecordDisplay({
        threadUrl: obj.threadUrl,
        id: "commentId",
      } as SizeRecord);
      assert.propertyVal(helper, "commentUrl", obj.expected);
    });
  });

  it("Should format the tag size", () => {
    const expected = "10D";
    const helper = new SizeRecordDisplay({ size: 10, width: "D" } as SizeRecord);
    assert.propertyVal(helper, "tagSize", expected);
  });
});
