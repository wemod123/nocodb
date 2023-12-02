const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const removeDir = promisify(fs.rmdir);
const copyFile = promisify(fs.copyFile);
const mkdir = promisify(fs.mkdir);

const guiLibSrcDir = path.join(__dirname, '../../nc-lib-gui');
const guiLibDestDir = path.join(__dirname, '../nc-lib-gui');

const sdkSrcDir = path.join(__dirname, '../../nocodb-sdk');
const sdkDestDir = path.join(__dirname, '../nocodb-sdk');

async function copyAndRemoveDirs(srcDir, destDir) {
  try {
    await mkdir(destDir, { recursive: true });
    await removeDir(destDir, { recursive: true });

    const files = await fs.promises.readdir(srcDir);

    for (const file of files) {
      const srcFile = path.join(srcDir, file);
      const destFile = path.join(destDir, file);
      await copyFile(srcFile, destFile);
    }

    console.log(`Copied from ${srcDir} to ${destDir}`);
  } catch (err) {
    console.error(`Error copying from ${srcDir} to ${destDir}: ${err}`);
  }
}

copyAndRemoveDirs(guiLibSrcDir, guiLibDestDir);
copyAndRemoveDirs(sdkSrcDir, sdkDestDir);