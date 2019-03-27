import { assert } from "chai";

import { BrannockSize } from "../src/brannock-size";
import {
  extractSizeRecords,
  fromSizingThread,
  getSizingThreads,
} from "../src/denormalize";
import { Comment } from "../src/reddit";


describe("Sizing threads", () => {
  const op = new Comment({
    kind: "t1",
    data: {
      author: "threadAuthor",
      id: "threadId",
      created_utc: 1,
      subreddit: "fake",
      url: "http://fake.com",
    },
  });

  const makeSizingThread = (author: string, body: string, replies: boolean) => {
    const emptyListingObj = {
      kind: "Listing",
      data: {
        children: [],
        modhash: "modhash",
      },
    };

    return new Comment({
      kind: "t1",
      data: {
        author,
        body,
        replies: replies ? emptyListingObj : null,
        id: "commentId",
        created_utc: 1,
        subreddit: "fake",
        url: "http://fake.com",
      },
    });
  };

  it("Should select top-level comments by the author", () => {
    const comments = [
      makeSizingThread(op.author, "##**Brannock Size: 8D**", true),
      makeSizingThread("someoneElse", "10D", true),
      makeSizingThread(op.author, "##**Brannock Size: 9D**", true),
    ];
    const expected = [
      { id: "commentId", brannockSize: new BrannockSize(8, "D"), replies: [] },
      { id: "commentId", brannockSize: new BrannockSize(9, "D"), replies: [] },
    ];

    const out = getSizingThreads(op, comments);
    assert.deepStrictEqual(out, expected);
  });

  it("Should select top-level comments with non-null replies member", () => {
    const comments = [
      makeSizingThread(op.author, "##**Brannock Size: 8D**", false),
      makeSizingThread(op.author, "##**Brannock Size: 9D**", true),
    ];
    const expected = [
      { id: "commentId", brannockSize: new BrannockSize(9, "D"), replies: [] },
    ];

    const out = getSizingThreads(op, comments);
    assert.deepStrictEqual(out, expected);
  });

  it("Should get Brannock size", () => {
    const comments = [
      makeSizingThread(op.author, "##**Brannock Size: 8D**", true),
    ];
    const expectedSize = 8;
    const expectedWidth = "D";

    const out = getSizingThreads(op, comments);
    assert.lengthOf(out, 1);
    assert.strictEqual(out[0].brannockSize.size, expectedSize);
    assert.strictEqual(out[0].brannockSize.width, expectedWidth);
  });
});

describe("Extract size records from comment", () => {
  it("Should get size records", () => {
    const md = [
      "Here are mine:",
      "Alden Indy: 10D",
      "Viberg 2030: 9.5D",
    ].join("\n");
    const expected = [
      { size: 10, width: "D", intl: null, mlast: "Alden Indy", sizingText: "10D" },
      { size: 9.5, width: "D", intl: null, mlast: "Viberg 2030", sizingText: "9.5D" },
    ];

    const out = extractSizeRecords(md);
    assert.deepStrictEqual(out, expected);
  });
});

describe("Extract size records from all sizing thread comments", () => {
  const makeResponseComment = (id: number, lines: string[]) => {
    const commentId = `comment_${id}`;
    return new Comment({
      kind: "t1",
      data: {
        author: "respondent",
        body: lines.join("\n"),
        id: commentId,
        created_utc: 1,
        subreddit: "fake",
        url: "http://fake.com",
      },
    });
  };

  it("Should get flattened size records", () => {
    const replies = [
      makeResponseComment(1, [ "Alden Indy: 8D", "Viberg 2030: 7D" ]),
      makeResponseComment(2, [ "Red Wing: 8D" ]),
    ];
    const sizingThread = { id: "id", brannockSize: new BrannockSize(8, "D"), replies };
    const expectedLength = 3;

    const out = fromSizingThread(sizingThread, "threadId", "threadUrl");
    assert.lengthOf(out, expectedLength);
  });

  it("Should attach sizing thread metadata", () => {
    const replies = [ makeResponseComment(2, [ "Red Wing: 8D" ]) ];
    const sizingThread = {
      id: "sizingThreadId",
      brannockSize: new BrannockSize(8, "D"),
      replies,
    };

    const out = fromSizingThread(sizingThread, "threadId", "threadUrl");
    out.forEach((record: any) => {
      assert.propertyVal(record, "parentId", sizingThread.id);
      assert.propertyVal(record, "brannockSize", sizingThread.brannockSize);
    });
  });

  it("Should attach thread metadata", () => {
    const replies = [ makeResponseComment(2, [ "Red Wing: 8D" ]) ];
    const sizingThread = { id: "id", brannockSize: new BrannockSize(8, "D"), replies };
    const threadId = "threadId";
    const threadUrl = "threadUrl";

    const out = fromSizingThread(sizingThread, threadId, threadUrl);
    out.forEach((record: any) => {
      assert.propertyVal(record, "threadId", threadId);
      assert.propertyVal(record, "threadUrl", threadUrl);
    });
  });
});
