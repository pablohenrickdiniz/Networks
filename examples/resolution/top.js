const topDir = '/content/drive/MyDrive/ia-projects/resolution/top';
const jimp = require('jimp');
const original = '/content/drive/MyDrive/ia-projects/resolution/images/pexels-photo-7191774.jpeg';
const imagesDir = '/content/drive/MyDrive/ia-projects/resolution/outputs';
const fs = require('fs');
const path = require('path');

async function sortImages(images){
    let sourceImage = await jimp.read(original);
    let distances = [];
    let total = images.length;
    let p,op;
    for(let i = 0; i < images.length;i++){
        try{
            let targetImage = await jimp.read(images[i]);
            distances.push({
                image:images[i],
                distance:jimp.distance(sourceImage,targetImage),
                diff: jimp.diff(sourceImage,targetImage)
            });
            p = (i*100/total).toFixed(2);
            if(p !== op){
                op = p;
                console.log(`${p}% sorting images...`);
            }
        }
        catch(e){

        }
    }
    return distances.sort((a,b) => {
        let diff = a.distance - b.distance;
        if(diff === 0){
            diff = a.diff - b.diff;
        }
        return diff;
    });
}

module.exports = async function(max,maxi){
    maxi = maxi || max;
    let images = fs.readdirSync(imagesDir).map((f) => path.join(imagesDir,f));
    if(images.length > max){
        let distances = await sortImages(images);
        let remove = distances.slice(maxi);
        for(let i = 0; i < remove.length;i++){
            fs.unlinkSync(remove[i].image);
        }
        let tmp = distances.slice(0,maxi);
        let total = tmp.length;
        let p, op;
        for(let i = 0; i < tmp.length;i++){
            let sourceName = tmp[i].image;
            let parsed = path.parse(sourceName);
            let name = parsed.name.split('_');
            name = name[name.length-1];
            let targetName = path.join(parsed.dir,String(i).padStart(4,'0')+'_'+name+parsed.ext);
            fs.renameSync(sourceName,targetName);
            p = (i*100/total).toFixed(2);
            if(p !== op){
                op = p;
                console.log(`${p}% renaming images images...`);
            }
        }
    }
};