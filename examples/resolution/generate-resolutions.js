const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const config = require('./config');
const prepare = require('../../helpers/prepare');
const tmp = require('tmp');

async function generateResolution(image,resolution){
    if(!fs.existsSync(config.resolutionsDir)){
        fs.mkdirSync(config.resolutionsDir,{recursive:true});
    }

    let resolutionDir = path.join(config.resolutionsDir,resolution.join('x'));

    if(!fs.existsSync(resolutionDir)){
        fs.mkdirSync(resolutionDir,{recursive:true});
    }
  
    try{
        let parsed = path.parse(image);
        let sharpImage = await sharp(image);
        if(sharpImage !== null){
            let meta = await sharpImage.metadata();
            if(meta.width >= resolution[0] && meta.height >= resolution[1]){
                let index = 0;
                for(let left = 0; left < meta.width - resolution[0]; left += resolution[0]){
                    for(let top = 0; top < meta.height - resolution[1]; top += resolution[1]){
                        let filename = path.join(resolutionDir,parsed.name+String(index)+'.png');
                        index++;
                        if(fs.existsSync(filename)){
                            continue;
                        }
                        (await prepare(sharpImage.extract({left:0, top: 0,width: resolution[0], height: resolution[1]}))).toFile(filename);
                    }
                }
            }
        }
    }
    catch(e){

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