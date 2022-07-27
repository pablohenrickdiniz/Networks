const config = require('./config');
const fs = require('fs');
const path = require('path');
const Network = require('../../Networks/Network');
const sharp = require('sharp');
const predict_model = require('./predict_model');

async function extract(img,left,top,width,height){
    let buffer = await img.extract({left:left,top:top,width:width,height:height}).toBuffer();
    return sharp(buffer,{
        raw:{
            width:width,
            height:height,
            channels:4
        }
    });
}

async function enchance(img,model){

  
    let inputShape = model.options.inputShape;
    let meta = await img.metadata();
    
    let [modelHeight,modelWidth] = inputShape;
    let imageWidth = meta.width, imageHeight = meta.height;
   
    if(imageWidth > modelWidth || imageHeight > modelHeight){
        let hw = Math.floor(imageWidth/2);
        let hh = Math.floor(imageHeight/2);
      
        let topLeft = await enchance(await extract(img,0,0,hw,hh),model);


        process.exit();
        let topRight = await enchance(await extract(img,hw,0,hw,hh),model);
        let bottomRight = await enchance(await extract(img,hw,hh,hw,hh),model);
        let bottomLeft =  await enchance(await extract(img,0,hh,hw,hh),model);
      
      
        img = sharp().composite([
            {input: topLeft, top: 0, left: 0},
            {input: topRight, top: 0, left: hw},
            {input: bottomRight, top: hh, left: hw},
            {input: bottomLeft, top: hh, left: 0}
        ]).png().ensureAlpha();

       
    }
    return await predict_model(img,model);
}

(async function(){
    if(!fs.existsSync(config.enchanceDir)){
        fs.mkdirSync(config.enchanceDir,{recursive: true});
    }

    let dirs = fs.readdirSync(config.modelsDir).map((d) => path.join(config.modelsDir,d));
    let models = [];
    for(let i = 0; i < dirs.length;i++){
        let model = new Network();
        await model.load(dirs[i]);
        models.push(model);
    }

    let images = fs
        .readdirSync(config.enchanceDir)
        .map((img) => path.join(config.enchanceDir,img))
        .map(function(img){
            try{
                return sharp(img).png().ensureAlpha();
            }
            catch(e){

            }
            return null;
        })
        .filter((img) => img !== null);

    for(let i = 0; i < images.length;i++){
        let img = images[i];
        for(let j = 0; j < models.length;j++){
            let model = models[i];
            let output = await enchance(img,model);
            console.log(output,'ok');
            process.exit();
        }
    }
})();