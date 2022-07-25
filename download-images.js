const  fs = require('fs');
const imagesDir = '/content/drive/MyDrive/ia-projects/resolution/downloaded-images';
const path = require('path');
const pexels = require('./api/pexels');
const pixabay = require('./api/pixabay');
const axios = require('axios');
const total = 10000;

if(!fs.existsSync(imagesDir)){
    fs.mkdirSync(imagesDir,{
        recursive: true
    });
}

async function downloadImages(images,index){
    let downloaded = 0;
    let promises = [];
    for(let i = 0; i < images.length;i++){
        let image = images[i];
        let name = base(image);
        let outputFile = path.join(imagesDir,name);
        let promise = axios({
            method: 'GET',
            url: image,
            responseType: 'arraybuffer'
        }).then(function(response){
            if(response.status === 200){
                fs.writeFile(outputFile,response.data,(err) => {
                    if(!err){
                        downloaded++;
                        index++;
                        console.log(`${index}/${total} - imagem ${name} salva com sucesso`);
                    }
                });
            }
        });
        promises.push(promise);
    }
    try{
        await Promise.all(promises);
    }
    catch(e){
      
    }
    return downloaded;
}

function base(url){
    return path.basename(url).split('?')[0];
}

(async function(){
    let existingFiles = fs.readdirSync(imagesDir);
    let downloaded = existingFiles.length;
    while(downloaded < total){
        let page =  Math.floor(Math.random()*10);
        let images = (await pixabay({
                page: page,
                per_page: 50
            }))
            .map((img) => img.largeImageURL)
            .filter(function(url){
                return existingFiles.indexOf(path.basename(url)) === -1;
            });


            // images = images.concat((await pexels({
            //     page: page,
            //     per_page: 50
            // }))
            // .map(function(img){
            //     return img.src.large2x;
            // })
            // .filter(function(url){
            //     return existingFiles.indexOf(base(url)) === -1;
            // }));
       
        images = images.sort(() => Math.random() - 0.5);
        downloaded += (await downloadImages(images,downloaded+1));
        console.log(`searching page ${page}...`);
        existingFiles = fs.readdirSync(imagesDir);
    }
})();