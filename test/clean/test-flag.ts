import { assert } from "chai";

import { hasValidShoeLast } from "../../src/clean/flag";


describe("Flag invalid manufacturer lasts", () => {
  it("Should return true for valid last", () => {
    const shoeLast = "Viberg";
    const valid = hasValidShoeLast(shoeLast);
    assert.isTrue(valid);
  });

  it("Should return false for notes", () => {
    const shoeLast = "Notes";
    const valid = hasValidShoeLast(shoeLast);
    assert.isFalse(valid);
  });

  it("Should return false for unexpected notes", () => {
    const shoeLast = "Something/Notes";
    const valid = hasValidShoeLast(shoeLast);
    assert.isFalse(valid);
  });

  it("Should return false for Brannock", () => {
    const shoeLast = "Brannock";
    const valid = hasValidShoeLast(shoeLast);
    assert.isFalse(valid);
  });

  it("Should return false for Brannock Size", () => {
    const shoeLast = "Brannock Size";
    const valid = hasValidShoeLast(shoeLast);
    assert.isFalse(valid);
  });

  it("Should return false for Size", () => {
    const shoeLast = "Size";
    const valid = hasValidShoeLast(shoeLast);
    assert.isFalse(valid);
  });
});
