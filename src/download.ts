// Download sizing thread(s) from Reddit.

import { promises as fs } from "fs";
import fetch from "node-fetch";
import * as path from "path";


const BASE_URL = "https://www.reddit.com/r/goodyearwelt";
const THREADS = [
  { year: 2017, path: "comments/5ibtzh/manufacturer_last_sizing_thread" },
  { year: 2018, path: "comments/7t1whc/manufacturer_last_sizing_thread_2018" },
];


export function makeUserAgent(): string {
  const platform = "N/A";
  const { npm_package_name, npm_package_version, npm_package_author_name } = process.env;
  const software = `${platform}:${npm_package_name}:v${npm_package_version}`;
  return `${software} (by ${npm_package_author_name})`;
}

export function makeURL(urlPath: string): string {
  return `${BASE_URL}/${urlPath}/.json`;
}

export async function fileExists(filename: string): Promise<boolean> {
  return fs.access(filename)
    .then(() => true)
    .catch((err) => err.code !== "ENOENT");
}

export async function downloadThread(url: string, filename: string): Promise<void> {
  const exists = await fileExists(filename);
  if (exists) {
    // Treat file as cached data that can only be manually invalidated.
    console.debug(`${filename} already exists, skipping download`);
    return;
  }

  console.debug(`Downloading ${filename}`);
  const headers = { "User-Agent": makeUserAgent() };
  const response = await fetch(url, { headers });
  const data = await response.json();
  const pretty = JSON.stringify(data, null, 2);
  await fs.writeFile(filename, pretty, "utf8");
}

export async function downloadAll(outputDir: string, prefix: string): Promise<void> {
  // Allow partial data to be written (as separate files).
  await Promise.all(
    THREADS
    .map(async (thread) => {
      const url = makeURL(thread.path);
      const filename = prefix + thread.year.toString() + ".json";
      const qFilename = path.join(outputDir, filename);
      return await downloadThread(url, qFilename);
    }),
  );
}
