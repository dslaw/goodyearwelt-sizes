import { promises as fs } from "fs";
import * as handlebars from "handlebars";
import * as path from "path";


interface Templates {
  [name: string]: (param: any) => string;
}


const PARTIALS = [ "table", "dropdown", "nav" ];

export async function loadTemplates(templatesDir: string, ext: string = ".html"): Promise<Templates> {
  const filenames = await fs.readdir(templatesDir);
  const allTemplates = await Promise.all(
    filenames
    .filter((filename) => path.extname(filename) === ext)
    .map((filename) => path.join(templatesDir, filename))
    .map(async (filename) => {
      const contents = await fs.readFile(filename, "utf8");
      const template = handlebars.compile(contents.toString());
      const name = path.basename(filename).replace(ext, "");
      return [ name, template ];
    }),
  );
  const templates = allTemplates.reduce((obj, [ name, template ]) => {
    return Object.assign(obj, { [name as string]: template });
  }, {});

  PARTIALS.forEach((partial) => {
    const template = templates[partial];
    if (template) {
      handlebars.registerPartial(partial, template);
    }
    // Let the site generator error out at runtime if a partial wasn't
    // loaded and registered.
  });

  return templates;
}
