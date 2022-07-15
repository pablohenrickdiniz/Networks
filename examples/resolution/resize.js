const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');
const path = require('path');
const sharp = require('./sharp');
const imagesDir = '/content/drive/MyDrive/ia-projects/resolution/images';
const highResDir = '/content/drive/MyDrive/ia-projects/resolution/high-resolution';
const lowResDir  = '/content/drive/MyDrive/ia-projects/resolution/low-resolution';

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
        let index = i +1;
        let sourceImage = images[i];
        let highResImage = path.join(highResDir,path.basename(sourceImage));
        let lowResImage = path.join(lowResDir,path.basename(sourceImage));
        
        if(!fs.existsSync(highResImage)){
            let sharpSource =  (await sharp(sourceImage));
            if(sharpSource === null){
                continue;
            }
            await sharpSource.resize(2048,2048).toFile(highResImage);
            console.log(`${index}/${images.length} - high resolution image saved to ${highResImage}`);
        }
        else{
            console.log(`${index}/${images.length} - file ${highResImage} already exists!`);
        }

        let sharpHigh = (await sharp(highResImage));
        
        if(sharpHigh === null){
            continue;
        }

        if(!fs.existsSync(lowResImage)){
            await sharpHigh.resize(128,128).toFile(lowResImage);
            console.log(`${index}/${images.length} - low resolution image saved to ${lowResImage}`);
        }
        else{
            console.log(`${index}/${images.length} - file ${lowResImage} already exists!`);
        }
    }
})();