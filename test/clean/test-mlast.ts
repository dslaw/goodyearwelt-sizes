import { assert } from "chai";

import { cleanManufacturerLast } from "../../src/clean/mlast";


describe("Clean manufacturer last", () => {
  it("Should remove ampersand entity", () => {
    const mlast = "Crockett &amp; Jones 111";
    const expected = "Crockett & Jones 111";
    const out = cleanManufacturerLast(mlast);
    assert.deepStrictEqual(out, expected);
  });

  it("Should collapse spaces", () => {
    const mlast = "Crockett &    Jones 111";
    const expected = "Crockett & Jones 111";
    const out = cleanManufacturerLast(mlast);
    assert.deepStrictEqual(out, expected);
  });

  it("Should remove text inside parentheses", () => {
    const mlast = "Redwing (Iron Rangers)";
    const expected = "Redwing";
    const out = cleanManufacturerLast(mlast);
    assert.deepStrictEqual(out, expected);
  });

  it("Should handle empty string", () => {
    const mlast = "";
    const expected = null;
    const out = cleanManufacturerLast(mlast);
    assert.strictEqual(out, expected);
  });

  it('Should remove phrase "unknown last"', () => {
    const mlast = "unknown last";
    const expected = null;
    const out = cleanManufacturerLast(mlast);
    assert.strictEqual(out, expected);
  });

  it('Should remove trailing phrase "last"', () => {
    const mlast = "Viberg 2030 last";
    const expected = "Viberg 2030";
    const out = cleanManufacturerLast(mlast);
    assert.deepStrictEqual(out, expected);
  });

  it("Should strip trailing whitespace", () => {
    const mlast = "Viberg 2030 ";
    const expected = "Viberg 2030";
    const out = cleanManufacturerLast(mlast);
    assert.deepStrictEqual(out, expected);
  });

  it("Should remove unicode bullet", () => {
    const mlast = "• Viberg 2030";
    const expected = "Viberg 2030";
    const out = cleanManufacturerLast(mlast);
    assert.deepStrictEqual(out, expected);
  });

  it("Should clean", () => {
    const mlast = " Crockett &amp; Jones 111 last ";
    const expected = "Crockett & Jones 111";
    const out = cleanManufacturerLast(mlast);
    assert.deepStrictEqual(out, expected);
  });
});
