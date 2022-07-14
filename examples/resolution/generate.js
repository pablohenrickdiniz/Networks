const predict = require('./predict');
const fs = require('fs');
const path = require('path');
const imagesDir = '../../images';
(async function(){
    let dirs = fs
        .readdirSync('./models')
        .map((d) => path.join('./models',d));

    for(let i = 0; i < dirs.length;i++){
        let modelDir = dirs[i];
        let outputDir = path.join('./outputs',path.basename(modelDir));
        await predict(modelDir,imagesDir,outputDir);
    }
})();