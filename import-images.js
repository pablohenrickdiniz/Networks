const importDir = '/content/drive/MyDrive/ia-projects/resolution/downloaded-images';
const outputDir = '/content/drive/MyDrive/ia-projects/resolution/images';
const fs = require('fs');
const sharp = require('sharp');
const path = require('path');
const fileHash = require('./file-hash');

async function importImages(file){
    if(fs.existsSync(file)){
        let stat = fs.statSync(file);
        if(stat.isDirectory()){
            let files = fs.readdirSync(file).map((f) => path.join(file,f));
            for(let i = 0; i < files.length;i++){
                importImages(files[i]);
            }
        }
        else if(stat.isFile()){
            try{
                let image = sharp(file).trim();
                let meta = await image.metadata();
                if(meta.width > 16 && meta.height > 12){
                    let hash = fileHash(file);
                    let filename = path.join(outputDir, hash+'.jpeg');
                    if(filename !== file){
                       if(!fs.existsSync(filename)){
                           await image.jpeg().toFile(filename);
                           console.log(`image ${filename} saved!`);
                        }
                    }
                }
            }
            catch(e){

            }
        }
    }
}

(async function(){
    if(!fs.existsSync(outputDir)){
        fs.mkdirSync(outputDir,{recursive:true});
    }
    importImages(importDir);
})();