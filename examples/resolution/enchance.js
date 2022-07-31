const config = require('./config');
const fs = require('fs');
const path = require('path');
const Network = require('../../Networks/Network');
const sharp = require('sharp');
const predict_model = require('./predict_model');
const prepare = require('../../helpers/prepare');


async function extract(img,left,top,width,height){
    return await prepare(
        img.clone().extract({left:left,top:top,width:width,height:height})
    );
}

async function enchance(img,model,imageWidth,imageHeight){
    let inputShape = model.options.inputShape;
    let [modelHeight,modelWidth] = inputShape;

    if(imageWidth === undefined || imageHeight === undefined){
        let meta = await img.metadata();
        imageWidth = meta.width;
        imageHeight = meta.height;
    }
   
    if(imageWidth > modelWidth || imageHeight > modelHeight){
        let hw = Math.floor(imageWidth/2);
        let hh = Math.floor(imageHeight/2);

        let topLeft = await enchance(await extract(img,0,0,hw,hh),model,hw,hw);
        let topRight = await enchance(await extract(img,hw,0,hw,hh),model,hw,hw);
        let bottomRight = await enchance(await extract(img,hw,hh,hw,hh),model,hw,hw);
        let bottomLeft =  await enchance(await extract(img,0,hh,hw,hh),model,hw,hw);
        
        img = sharp({
            create:{
                width: imageWidth,
                height: imageHeight,
                channels: 4,
                background: { r: 255, g: 255, b: 255, alpha: 0 }
            }
        });
        img = await prepare(img);
        img =  img
            .composite([
                {input: await topLeft.toBuffer(), top: 0, left: 0},
                {input: await topRight.toBuffer(), top: 0, left: hw, width: hw, height: hh},
                {input: await bottomRight.toBuffer(), top: hh, left: hw, width: hw, height: hh},
                {input: await bottomLeft.toBuffer(), top: hh, left: 0, width: hw, height: hh}
            ]);

        img = await prepare(img);
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
        .filter(function(img){
            try{
                sharp(img);
                return true;
            }
            catch(e){

            }
            return false;
        });

    for(let i = 0; i < images.length;i++){
        let img = images[i];
        for(let j = 0; j < models.length;j++){
            let model = models[j];
            let output = await enchance(await prepare(sharp(img)),model);
            let inputShape = model.options.inputShape;
            let parsed = path.parse(img);
            let outputFile = path.join(config.enchanceDir,parsed.name+'_'+inputShape.join('_')+parsed.ext);
            console.log(`salvando ${outputFile}...`);
            fs.writeFileSync(outputFile,await output.toBuffer());
        }
    }
})();