// Build the static site.
//
// Sizing information from Reddit is downloaded from known
// threads. If a downloaded thread already exists in the intermediate
// data directory, it is skipped. Flattened sizing information is written
// to the data directory as an intermediate step, intended for debugging
// or some other purpose. The actual static site is written to the
// build directory. Preexisting files in the data and build directories
// may be overwritten!

import { promises as fs } from "fs";
import * as _ from "lodash";
import * as path from "path";

import { BrannockSize } from "./src/brannock-size";
import { extract, readThread, SizeRecordWithMetadata } from "./src/denormalize";
import { downloadAll } from "./src/download";
import { groupBrannockSizes, groupMlasts, loadTemplates, TablesPage } from "./src/render";


const config = {
  dataDir: "data",
  buildDir: "build",
  threadFilenamePrefix: "last-sizing-thread-",
  recordsFilename: "size-records.json",
  sizesPageAttrs: {
    name: "sizes",
    title: "Brannock Sizes",
    subtitle: "r/goodyearwelt supplied sizes organized by Brannock size",
  },
  modelsPageAttrs: {
    name: "models",
    title: "Models & Lasts",
    subtitle: "r/goodyearwelt supplied sizes organized by Model/Last",
  },
};


interface Page {
  filename: string;
  html: string;
}


async function setupDirs(directories: string[]): Promise<void> {
  // Ensure each directory exists, creating them as necessary.
  directories.forEach(async (directory) => {
    try {
      await fs.mkdir(directory);
    } catch (err) {
      if (err.code !== "EEXIST") {
        throw err;
      }
    }
  });
}

async function readAll(dataDir: string, pattern: string): Promise<SizeRecordWithMetadata[]> {
  const filenames = await fs.readdir(dataDir);
  const sizeRecordsByThread = await Promise.all(
    filenames
      .map(async (filename) => {
        if (!filename.includes(pattern)) {
          return [];
        }

        const fname = path.join(dataDir, filename);
        const { op, comments } = await readThread(fname);
        return extract(op, comments);
      }),
  );
  const sizeRecords = _.flatten(sizeRecordsByThread);
  return sizeRecords;
}

async function writeRecords(sizeRecords: SizeRecordWithMetadata[], outputFilename: string): Promise<void> {
  const data = JSON.stringify(sizeRecords, null, 2);
  await fs.writeFile(outputFilename, data, "utf8");
}

async function makePages(sizeRecords: SizeRecordWithMetadata[]): Promise<Page[]> {
  const templates = await loadTemplates("templates");

  const sizeTablesPage = new TablesPage<BrannockSize>(
    config.sizesPageAttrs.name,
    config.sizesPageAttrs.title,
    config.sizesPageAttrs.subtitle,
    groupBrannockSizes(sizeRecords),
  );
  const modelTablesPage = new TablesPage<string>(
    config.modelsPageAttrs.name,
    config.modelsPageAttrs.title,
    config.modelsPageAttrs.subtitle,
    groupMlasts(sizeRecords),
  );

  const sizePage = templates.page({
    ctx: sizeTablesPage,
    sizes: sizeTablesPage,
    models: modelTablesPage,
  });
  const modelPage = templates.page({
    ctx: modelTablesPage,
    sizes: sizeTablesPage,
    models: modelTablesPage,
  });

  const pages = [
    { filename: sizeTablesPage.filename, html: sizePage },
    { filename: modelTablesPage.filename, html: modelPage },
  ];
  return pages;
}

async function main(): Promise<void> {
  try {
    await setupDirs([ config.buildDir, config.dataDir ]);
    await downloadAll(config.dataDir, config.threadFilenamePrefix);
    const sizeRecords = await readAll(config.dataDir, config.threadFilenamePrefix);

    const recordsFilename = path.join(config.dataDir, config.recordsFilename);
    await writeRecords(sizeRecords, recordsFilename);

    const pages = await makePages(sizeRecords);
    pages.forEach(async ({ filename, html }) => {
      const buildFilename = path.join(config.buildDir, filename);
      await fs.writeFile(buildFilename, html, "utf8");
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
