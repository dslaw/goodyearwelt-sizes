import { assert } from "chai";

import { BrannockSize } from "../../src/brannock-size";
import { SizeRecord } from "../../src/denormalize";
import { groupBrannockSizes, groupMlasts } from "../../src/render/group";


function sizeRecords(): SizeRecord[] {
  const base = {
    id: "id",
    sizingText: "sizingTest",
    size: 10,
    width: null,
    intl: null,
    parentId: "parentId",
    threadId: "threadId",
    threadUrl: "threadUrl",
  };
  return [
    { ...base, mlast: "Alden", brannockSize: new BrannockSize(10, "D") },
    { ...base, mlast: "Alden", brannockSize: new BrannockSize(10, "E") },
    { ...base, mlast: "Alden", brannockSize: new BrannockSize(9, "D") },
    { ...base, mlast: "Red Wing", brannockSize: new BrannockSize(9, "D") },
    { ...base, mlast: "Red Wing", brannockSize: new BrannockSize(10, "D") },
  ];
}

describe("Group records by Brannock size", () => {
  it("Should create sorted groups", () => {
    const expectedGroups = [
      new BrannockSize(9, "D"),
      new BrannockSize(10, "D"),
      new BrannockSize(10, "E"),
    ];
    const expectedLengths = [ 2, 2, 1 ];

    const out = groupBrannockSizes(sizeRecords());
    const groups = out.map((t: any[]) => t[0]);
    const lengths = out.map((t: any[]) => t[1].length);
    assert.deepStrictEqual(groups, expectedGroups);
    assert.deepStrictEqual(lengths, expectedLengths);
  });

  it("Should sort by secondary criterion within each group", () => {
    const expectedMlasts = [
      [ "Alden", "Red Wing" ], // 9D
      [ "Alden", "Red Wing" ], // 10D
      [ "Alden" ], // 10E
    ];

    const out = groupBrannockSizes(sizeRecords());
    const mlasts = out.map((t: any[]) => t[1].map((o: any) => o.mlast));
    assert.deepStrictEqual(mlasts, expectedMlasts);
  });
});


describe("Group records by manufacturer/model/last", () => {
  it("Should create sorted groups", () => {
    const expectedGroups = [ "Alden", "Red Wing" ];
    const expectedLengths = [ 3, 2 ];

    const out = groupMlasts(sizeRecords());
    const groups = out.map((t: any[]) => t[0]);
    const lengths = out.map((t: any[]) => t[1].length);
    assert.deepStrictEqual(groups, expectedGroups);
    assert.deepStrictEqual(lengths, expectedLengths);
  });

  it("Should sort by secondary criterion within each group", () => {
    const expectedBrannockSizes = [
      [ new BrannockSize(9, "D"), new BrannockSize(10, "D"), new BrannockSize(10, "E") ],
      [ new BrannockSize(9, "D"), new BrannockSize(10, "D") ],
    ];

    const out = groupMlasts(sizeRecords());
    const brannockSizes = out.map((t: any[]) => t[1].map((o: any) => o.brannockSize));
    assert.deepStrictEqual(brannockSizes, expectedBrannockSizes);
  });
});
