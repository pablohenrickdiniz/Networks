const predict = require('./predict');
const fs = require('fs');
const path = require('path');
const config = require('./config');

(async function(){
    let dirs = fs
        .readdirSync(config.modelsDir)
        .map((d) => path.join(config.modelsDir,d));

    for(let i = 0; i < dirs.length;i++){
        let modelDir = dirs[i];
        await predict(modelDir,config.imagesDir,config.outputsDir,true);
    }
})();