const HeightMap = require('./HeightMap');
const max = Number.MAX_SAFE_INTEGER;
const fs = require('fs');
const config = require('./config');
const path = require('path');
const tf = require('@tensorflow/tfjs-node');

async function generate_and_save(sx,sy,width,height,iterations){
    let scale = Math.pow(2,iterations-1)*7.8125;
    let map = new HeightMap({
        seed:0,
        iterations:iterations,
        scale:scale
    });
    let imageName = path.join(config.imagesDir,scale+'_'+width+'_'+height+'_'+sx+'_'+sy+'.jpeg');
    let data = [];
    for(let y = sy; y < sy+height;y++){
        for(let x = sx; x < sx+width;x++){
            data.push(map.get(x,y));
        }
    }
    data = data.map((v) => [v,v,v]);
    let encoded = await tf.node.encodeJpeg(tf.tensor(data).reshape([height,width,3]).mul(255).round().maximum(0).minimum(255));
    console.log(imageName);
    fs.writeFileSync(imageName,encoded);
}


(async function(){
    if(!fs.existsSync(config.imagesDir)){
        fs.mkdirSync(config.imagesDir,{recursive: true});
    }

    for(let i = 0; i < config.sizes.length;i++){
        let size = config.sizes[i];
        for(let iterations = 5; iterations <= 8; iterations++){
            await generate_and_save(0,0,size[0],size[1],iterations);
            //await generate_and_save(0,-size[1],size[0],size[1],iterations);
            //await generate_and_save(-size[0],0,size[0],size[1],iterations);
            //await generate_and_save(-size[0],-size[1],size[0],size[1],iterations);
        }
    }
})();