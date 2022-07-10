const generateTrainingData = require('./generate-training-data');
const generateImage = require('./generate-image');
const fs = require('fs');
const stringHash = require('string-hash');
const configDir = '/app/examples/perlin-noise/configs';
const Network = require('../../Networks/Network');
const path = require('path');

(async function(){
    if(!fs.existsSync(configDir)){
        return;
    }
    let configs = fs.readdirSync(configDir).map((file) => path.join(configDir,file));
    while(true){
        let trainingData = generateTrainingData(10000);
        let promises = [];
        for(let i = 0; i < configs.length;i++){
            let config = JSON.parse(fs.readFileSync(configs[i],{encoding:'utf-8'}));
            let hash = stringHash(JSON.stringify(config));
            let c = new Network(config);
            let modelDir = '/app/models/perlin-noise/'+hash;
            let outputFile = '/app/outputs/'+hash+'.png';
        
            if(!fs.existsSync(modelDir)){
                fs.mkdirSync(modelDir,{recursive:true});
            }
        
            console.log(`carregando modelo ${hash}...`);
            await c.load(modelDir);
            let promise = c.train(trainingData,100,async function(epoch,epochs,loss,acc){
                console.log(`${epoch}/${epochs} loss:${loss}, accuracy:${acc}`);
                await c.save(modelDir);
            },async function(){
                fs.writeFileSync(outputFile,Buffer.from(await generateImage(c)),'binary');
            });
            promises.push(promise);
        }
        await Promise.all(promises);
    }
})();
