import { expect, test } from '@oclif/test';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const rimraf = require("rimraf").sync;

const tempDir = path.join(__dirname, "..", "..", "tmp");

describe("create", () => {
  beforeEach(async () => {
    try {
      await promisify(fs.mkdir)(tempDir);
    } catch {}
    rimraf(path.join(tempDir, "*"));
  });

  test
    .stdout()
    .command(["create", "My Add-on", "--skipPrompt", "-p", tempDir])
    .it("runs create", async () => {
      const stats = await promisify(fs.stat)(path.join(tempDir, "MyAddOn"));
      expect(stats.isDirectory()).to.be.true;
    });
});
