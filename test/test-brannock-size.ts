import { assert } from "chai";

import { BrannockSize, formatSize } from "../src/brannock-size";


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

describe("Modeled Brannock size", () => {
  it("Should instantiate from string values", () => {
    const brannockSize = new BrannockSize("8.5", "d");
    assert.strictEqual(brannockSize.size, 8.5);
    assert.strictEqual(brannockSize.width, "D");
  });

  const stringExpected = [
    { str: "8D", size: 8, width: "D" },
    { str: "8.5D", size: 8.5, width: "D" },
    { str: "10D", size: 10, width: "D" },
    { str: "10.5D", size: 10.5, width: "D" },
    { str: "10.5 Narrow", size: 10.5, width: "NARROW" },
    { str: "10.5 Wide", size: 10.5, width: "WIDE" },
  ];

  stringExpected.forEach((obj: any) => {
    it(`Should instantiate string "${obj.str}"`, () => {
      const brannockSize = BrannockSize.fromString(obj.str);
      assert.strictEqual(brannockSize.size, obj.size);
      assert.strictEqual(brannockSize.width, obj.width);
    });
  });

  const commentExpected = [
   { body: "##**Brannock:** 8.5D", id: "id123", size: 8.5, width: "D" },
   { body: "#8.5D", id: "id123", size: 8.5, width: "D" },
   { body: "#8.5 Narrow", id: "id123", size: 8.5, width: "NARROW" },
   { body: "#8.5 Wide", id: "id123", size: 8.5, width: "WIDE" },
  ];

  commentExpected.forEach((obj: any) => {
    it(`Should instantiate from comment "${obj.body}"`, () => {
      const brannockSize = BrannockSize.fromComment(obj);
      assert.strictEqual(brannockSize.size, obj.size);
      assert.strictEqual(brannockSize.width, obj.width);
    });
  });

  const brannocksizeExpected = [
    { str: "8D", brannock: new BrannockSize(8, "D") },
    { str: "8.5D", brannock: new BrannockSize(8.5, "D") },
    { str: "10D", brannock: new BrannockSize(10, "D") },
    { str: "10.5D", brannock: new BrannockSize(10.5, "D") },
    { str: "10.5 Narrow", brannock: new BrannockSize(10.5, "NARROW") },
    { str: "10.5 Wide", brannock: new BrannockSize(10.5, "WIDE") },
  ];

  brannocksizeExpected.forEach((obj: any) => {
    it("Should cast to string", () => {
      const brannockSize = obj.brannock;
      assert.strictEqual(brannockSize.toString(), obj.str);
    });
  });

  brannocksizeExpected.forEach((obj: any) => {
    it("Should instantiate from the result of a string cast", () => {
      const brannockSize = obj.brannock;
      const out = BrannockSize.fromString(brannockSize.toString());
      assert.strictEqual(brannockSize.size, out.size);
      assert.strictEqual(brannockSize.width, out.width);
    });
  });
});
