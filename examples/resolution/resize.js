const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');
//const sharp = require('sharp');
const path = require('path');
const sharp = require('./sharp');
const imagesDir = './original';
const highResDir = './high-resolution';
const lowResDir  ='./low-resolution';

(async function(){
    if(!fs.existsSync(imagesDir)){
        fs.mkdirSync(imagesDir,{recursive:true});
    }
    
    if(!fs.existsSync(highResDir)){
        fs.mkdirSync(highResDir,{recursive:true});
    }

    if(!fs.existsSync(lowResDir)){
        fs.mkdirSync(lowResDir,{recursive:true});
    }
    
    let images = fs.readdirSync(imagesDir).map((f) => path.join(imagesDir,f));
    for(let i = 0; i < images.length;i++){
        let sourceImage = images[i];
        let highResImage = path.join(highResDir,path.basename(sourceImage));
        let lowResImage = path.join(lowResDir,path.basename(sourceImage));
        
        let sharpSource =  (await sharp(sourceImage));
        if(sharpSource === null){
            continue;
        }
        await sharpSource.resize(2048,2048,{fit:'fill'}).toFile(highResImage);
        let sharpHigh = (await sharp(highResImage));
        if(sharpHigh === null){
            continue;
        }
        await sharpHigh.resize(128,128,{fit:'fill'}).toFile(lowResImage);
    }
})();