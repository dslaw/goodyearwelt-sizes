import { assert } from "chai";

import { fileExists, makeURL, makeUserAgent } from "../src/download";


describe("Make the user-agent header", () => {
  it("Should return a non-empty string", () => {
    const userAgent = makeUserAgent();
    assert.isNotEmpty(userAgent);
  });
});

describe("Make a Reddit thread URL", () => {
  it("Should include the given slug", () => {
    const slug = "thread";
    const url = makeURL(slug);
    assert.include(url, slug);
  });

  it("Should be a JSON resource", () => {
    const url = makeURL("thread");
    assert.ok(url.endsWith(".json"));
  });
});

describe("Check if a file exists", async () => {
  it("Should find an existing file", async () => {
    const thisFile = "test/test-download.ts";
    const exists = await fileExists(thisFile);
    assert.isTrue(exists);
  });

  it("Should not find a non-existing file", async () => {
    const thisFile = "test/foo/bar";
    const exists = await fileExists(thisFile);
    assert.isFalse(exists);
  });
});
