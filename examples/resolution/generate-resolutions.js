const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const config = require('./config');

async function generateResolution(image,resolution){
    if(!fs.existsSync(config.resolutionsDir)){
        fs.mkdirSync(config.resolutionsDir,{recursive:true});
    }

    let resolutionDir = path.join(config.resolutionsDir,resolution.join('x'));

    if(!fs.existsSync(resolutionDir)){
        fs.mkdirSync(resolutionDir,{recursive:true});
    }

    let filename = path.join(resolutionDir,path.basename(image));
    let sharpImage = await sharp(image);
    if(sharpImage !== null){
        await sharpImage.resize(resolution[0],resolution[1]).toFile(filename);
    }
}

(async function(){
    if(!fs.existsSync(config.imagesDir)){
        fs.mkdirSync(config.imagesDir,{recursive:true});
    }
    let images = fs.readdirSync(config.imagesDir).map((f) => path.join(config.imagesDir,f));
    let total = images.length*config.resolutions.length;
    let count = 0;
    let oldp, p;
    for(let i = 0; i < images.length;i++){
        for(let j = 0; j < config.resolutions.length;j++){
            await generateResolution(images[i],config.resolutions[j]);
            count++;
            p = (count*100/total).toFixed(2);
            if(p !== oldp){
                console.log(`${p}% - gerando resoluções ${config.resolutions[j].join('x')}...`);
                oldp = p;
            }
        }
    }
})();