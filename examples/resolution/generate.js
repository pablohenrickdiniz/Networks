const predict = require('./predict');
const fs = require('fs');
const path = require('path');
const imagesDir = '/content/drive/MyDrive/ia-projects/resolution/images';
const modelsDir = '/content/drive/MyDrive/ia-projects/resolution/models';
const outputsDir = '/content/drive/MyDrive/ia-projects/resolution/outputs';

(async function(){
    let dirs = fs
        .readdirSync(modelsDir)
        .map((d) => path.join(modelsDir,d));

    for(let i = 0; i < dirs.length;i++){
        let modelDir = dirs[i];
        await predict(modelDir,imagesDir,outputsDir);
    }
})();