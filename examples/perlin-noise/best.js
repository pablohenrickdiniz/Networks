const config = require('./config');
const fs = require('fs');
const path = require('path');
const Network = require('../../Networks/Network');
const generateImage = require('./generate-image');
const conf = require('./config');


function getModelName(c){
    return c.layers.map(function(l){
        return [
            l.type,
            l.units,
            l.filters,
            l.activation
        ].filter((f) => f !== undefined).join('_');
    })
    .filter((f) => f.length > 0)
    .concat([
        c.loss,
        c.optimizer
    ].filter((f) => f !== undefined))
    .join('_');
}

(async function(){
    let dirs = fs
        .readdirSync(config.modelsDir)
        .map((d) => path.join(config.modelsDir,d))
        .filter((f) => fs.existsSync(f) && fs.statSync(f).isDirectory());
   
    let data = [];

    for(let i = 0; i < dirs.length;i++){
        let net = new Network();
        await net.load(dirs[i]);
        data.push({
            loss: net.metrics.loss,
            acc: net.metrics.acc,
            dir:dirs[i]
        });
    }

    data = data.sort(function(ia,ib){
        let a = ia.loss === null?0:ia.loss;
        let b = ib.loss === null?0:ib.loss;
        let diff = a-b;
        if(diff === 0){
            a = ia.acc === null?0:ia.acc;
            b = ib.acc === null?0:ib.acc;
            diff = b-a;
        }
        return diff;
    });
    if(data[0]){
        let net = new Network();
        await net.load(data[0].dir);
        let image = await generateImage(net,{width:256,height:256});
        let name = 'best_model_'+getModelName(net.options)+'.jpeg';
        fs.writeFileSync(path.join(conf.outputsDir,name),image);
    }
})();