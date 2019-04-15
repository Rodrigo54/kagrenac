import * as path from 'path';
import * as Generator from 'yeoman-generator';

export default class extends Generator {
  constructor(args: string | string[], opts: object) {
    super(args, opts);
  }

  writing() {
    this.sourceRoot(this.options.template);
    this.destinationRoot(this.options.directory);

    this.fs.copyTpl(
      this.templatePath("addon.lua.tpl"),
      this.destinationPath(`${this.options.name}.lua`),
      this.options
    );

    this.fs.copyTpl(
      this.templatePath("addon.txt.tpl"),
      this.destinationPath(`${this.options.name}.txt`),
      this.options
    );

    this.fs.copyTpl(
      this.templatePath(path.resolve(this.options.template, "..", "kagrenac.json.tpl")),
      this.destinationPath(`kagrenac.json`),
      this.options
    );
  }
}
