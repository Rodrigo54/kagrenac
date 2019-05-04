import { Command, flags } from '@oclif/command';
import * as anymatch from 'anymatch';
import { promises  as fs } from 'fs';
import * as fsExtra from 'fs-extra';
import * as os from 'os';
import * as path from 'path';

const configs = require(path.join(process.cwd(), 'kagrenac.json'));

const IGNORE_LIST = [
  '.git',
  '**/.gitignore',
  '**/node_modules/**',
  '**/*.zip',
  '**/kagrenac.json',
  ...configs.ignore
];

export default class Copy extends Command {
  static description = "Copy the addon to the ESO addons folder";
  static flags = {
    pts: flags.boolean({
      char: "p",
      default: false,
    }),
  }

  files: string[] = [];

  async walk(dir: any, filelist: string[] = []) {
    const files = await fs.readdir(dir);
    for (const file of files) {
      if(anymatch(IGNORE_LIST, file)) { continue };
      const dirFile = path.join(dir, file);
      const dirent = await fs.stat(dirFile);
      if (dirent.isDirectory()) {
        const files = await this.walk(dirFile, dir.files);
        filelist.push(...files);
      } else {
        filelist.push(dirFile);
      }
    }
    return filelist;
  };

  async run() {
    const { flags } = this.parse(Copy);
    const folder = flags.pts ? "pts" : "live";

    const srcPath = path.join(
      process.cwd(),
      configs.src
    );

    const destPath = path.join(
      os.homedir(),
      "Documents",
      "Elder Scrolls Online",
      folder,
      "AddOns"
    );

    this.files = await this.walk(srcPath);

    for (let fileInclude of configs.include as string[]) {
      fileInclude = path.join(process.cwd(), fileInclude);
      const fileList = await this.walk(fileInclude);
      this.files.push(...fileList);
    }

    for (let file of this.files) {
      const fileSrc = file.substring(process.cwd().length);
      const fileDest = path.join(destPath, fileSrc);
      this.log(file);
      await fsExtra.copy(file, fileDest);
    }
  }
}
