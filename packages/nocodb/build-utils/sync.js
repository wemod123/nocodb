const fs = require('fs-extra');
const path = require('path');

const guiLibSrcDir = path.join(__dirname, '../../nc-lib-gui');
const guiLibDestDir = path.join(__dirname, '../nc-lib-gui');

fs.removeSync(guiLibDestDir);
fs.copySync(guiLibSrcDir, guiLibDestDir);

const sdkSrcDir = path.join(__dirname, '../../nocodb-sdk');
const sdkDestDir = path.join(__dirname, '../nocodb-sdk');

fs.removeSync(sdkDestDir)
fs.copySync(sdkSrcDir, sdkDestDir)