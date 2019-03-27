import { assert } from "chai";

import {
  isEU,
  matchSizing,
  reconcileIntl,
} from "../../src/extract/sizing";


describe("Check if a shoe size is EU", () => {
  it("Should be false", () => {
    assert.isFalse(isEU(8));
    assert.isFalse(isEU(14));
  });

  it("Should be true", () => {
    assert.isTrue(isEU(35));
    assert.isTrue(isEU(49));
  });
});

describe("Reconcile intl with size", () => {
  it("Should return EU if size is EU", () => {
    const sizing = { intl: "foo", size: "40", width: "" };
    const out = reconcileIntl(sizing);
    assert.strictEqual(out, "EU");
  });

  it("Should return null if size isnt EU but intl is", () => {
    const sizing = { intl: "EU", size: "10", width: "" };
    const out = reconcileIntl(sizing);
    assert.isNull(out);
  });

  it("Should do nothing if intl is null", () => {
    const sizing = { intl: null, size: "10", width: "" };
    const out = reconcileIntl(sizing);
    assert.isNull(out);
  });

  it("Should do nothing if size is null", () => {
    const sizing = { intl: "EU", size: null, width: "" };
    const out = reconcileIntl(sizing);
    assert.isNull(out);
  });
});

describe("Validate extracted sizing data", () => {
  it('Should return validated sizing data from "post"', () => {
    const post = { size: "10", width: "D", intl: "US" };
    const pre = { size: "10", width: "D", intl: null };
    const expected = { size: "10", width: "D", intl: "US" };

    const out = matchSizing(post, pre);
    assert.deepStrictEqual(out, expected);
  });

  it('Should fallback to "preceding match"', () => {
    const post = { size: "10", width: "D", intl: null };
    const pre = { size: "10", width: "D", intl: "US" };
    const expected = { size: "10", width: "D", intl: "US" };

    const out = matchSizing(post, pre);
    assert.deepStrictEqual(out, expected);
  });

  it("Should be null if sizes from precedes/post match differ", () => {
    const post = { size: null, width: null, intl: null };
    const pre = { size: null, width: null, intl: null };

    const out = matchSizing(post, pre);
    assert.isNull(out);
  });

  it("Should be null if size is not a float", () => {
    const post = { size: "foo", width: "D", intl: "US" };
    const pre = { size: "foo", width: "D", intl: null };

    const out = matchSizing(post, pre);
    assert.isNull(out);
  });
});
