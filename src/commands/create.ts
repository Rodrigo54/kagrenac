import { Command, flags } from '@oclif/command';
import { pascal } from 'change-case';
import { prompt } from 'enquirer';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { promisify } from 'util';

const createEnv = require("yeoman-environment").createEnv;

const isDirectory = async (...parts: string[]): Promise<boolean> => {
  try {
    const dir = path.resolve(...parts);
    const stats = await promisify(fs.stat)(dir);
    return stats.isDirectory();
  } catch {
    return false;
  }
};

const selectValidDirectory = async (
  ...dirs: string[]
): Promise<string | null> => {
  for (let dir of dirs) {
    if (await isDirectory(dir)) {
      return dir;
    }
  }
  return null;
};

export default class Create extends Command {
  static description = "create new add-on from a template";

  static examples = ["$ kagrenac create"];

  static flags = {
    help: flags.help({
      char: "h"
    }),
    skipPrompt: flags.boolean({
      char: "s",
      default: false,
    }),
    template: flags.string({
      char: "t",
      description: "name of built-in template or path to your own",
      required: true,
      default: "standalone"
    }),
    name: flags.string({
      char: "n",
      description: "name of the add-on"
    }),
    api: flags.string({
      char: "a",
      description: "interface version the add-on is compatible with",
      default: "100026"
    }),
    path: flags.string({
      char: "p",
      description:
        "where the add-on will be created (defaults to game add-ons folder)"
    }),
    author: flags.string({
      char: "u",
      description: "author of the add-on",
      default: "Your Name"
    }),
    description: flags.string({
      char: "d",
      description: "description of the add-on",
      default: ""
    }),
    variables: flags.string({
      char: "v",
      description: "space separated name of saved variables",
      default: ""
    })
  };

  static args = [
    {
      name: "title",
      description: "add-on name that will be displayed in game",
      required: true
    }
  ];

  async generate(type: string, generatorOpts: object = {}) {
    const env = createEnv();

    env.register(
      require.resolve(path.join("..", "generators", type)),
      `kagrenac:${type}`
    );

    await new Promise((resolve, reject) => {
      env.run(`kagrenac:${type}`, generatorOpts, (err: Error, results: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }

  async run() {
    const { args, flags } = this.parse(Create);

    const response: any = !flags.skipPrompt ? await prompt([
      {
        type: 'select',
        name: 'template',
        message: 'Please select a template:',
        initial: 'standalone',
        choices: [
          { name: 'standalone', message: 'Blank - A minimal addon with only the bare necessities'},
          { name: 'addon', message: 'Addon - A template with everything addons regularly need'},
          { name: 'library', message: 'Library - A template specifically for libraries'},
          { name: 'superduper', message: 'MySuperDuperTemplate - Has all the secret sauce'},
        ]
      },
      {
        type: 'input',
        name: 'name',
        message: 'What should the addon be called?',
        initial: pascal(args.title)
      },
      {
        type: 'input',
        name: 'author',
        message: 'Who is the author?'
      },
      {
        type: 'multiselect',
        name: 'api',
        message: 'Which API versions should it support?',
        initial: '100026',
        choices: [
          { name: '100027', message: 'Chapter: Elsweyr'},
          { name: '100026', message: 'Wrathstone DLC'},
          { name: '100025', message: 'Murkmire  DLC'},
          { name: '100024', message: 'Wolfhunter  DLC'},
        ],
      },
      {
        type: 'input',
        name: 'version',
        message: 'What Version should it start with?',
        initial: '1.0.0'
      },
      {
        type: 'input',
        name: 'addOnVersion',
        message: 'What AddOnVersion should it start with?',
        initial: '100'
      },
    ]) : {
      version: '1.0.0',
      addOnVersion: '100'
    };

    const opts = {
      now: new Date(),
      ...flags,
      ...args,
      ...response
    };

    if (flags.skipPrompt && !flags.name) {
      opts.name = pascal(args.title);
    }

    if(Array.isArray(opts.api)) {
      opts.api = opts.api.join(" ");
    }

    if (!opts.path) {
      opts.path = path.join(
        os.homedir(),
        "Documents",
        "Elder Scrolls Online",
        "live",
        "AddOns"
      );
    }

    if (!(await isDirectory(opts.path))) {
      this.error(`path '${opts.path}' could not be read`);
    }
    opts.directory = path.resolve(opts.path, opts.name);

    if (await isDirectory(opts.directory)) {
      this.error(`directory '${opts.directory}' already exist`);
    }

    const template = flags.skipPrompt ? flags.template : response.template;

    opts.template = await selectValidDirectory(
      path.resolve(template),
      path.resolve(__dirname, "..", "..", "templates", template)
    );

    if (!opts.template) {
      this.error(`template '${template}' could not be read`);
    }

    // this.log(opts);
    await this.generate("add-on", opts);
  }
}
