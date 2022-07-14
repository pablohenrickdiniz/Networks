const  fs = require('fs');
const imagesDir = '/content/drive/MyDrive/ia-projects/resolution/images';
const path = require('path');
const pexels = require('./api/pexels');
const axios = require('axios');
const total = 1000;
const minSize = 2048;

if(!fs.existsSync(imagesDir)){
    fs.mkdirSync(imagesDir,{
        recursive: true
    });
}

let ids = loadExistingIds();


async function downloadImages(images,index){
    let downloaded = 0;
    for(let i = 0; i < images.length;i++){
        let image = images[i];
        try{
            let name = path.basename(image);
            let outputFile = path.join(imagesDir,name);
            let response = await axios({
                method: 'GET',
                url: image,
                responseType: 'arraybuffer'
            });
            fs.writeFileSync(outputFile,response.data);
            console.log(`${index}/${total} - imagem ${name} salva com sucesso`);
            downloaded++;
            index++;
        }
        catch(e){

        }
    }

    return downloaded;
}

function loadExistingIds(){
    return fs.readdirSync(imagesDir).map(function(img){
        let match = img.match(/^pexels\-photo\-(\d+)\.jpeg$/);
        if(match && match[1]){
            return parseInt(match[1]);
        }
        return null;
    }).filter((id) => id !== null);
}

(async function(){
    let downloaded = ids.length;
    let page = 1;
    while(downloaded < total){
        let images = (await pexels({
            page: page,
            per_page: 10
        }))
        .filter(function(img){
            return ids.indexOf(img.id) === -1 &&
            (img.width > minSize || img.height > minSize);
        }).map((img) => img.src.original);
        downloaded += (await downloadImages(images,downloaded+1));
        page++;
    }
})();