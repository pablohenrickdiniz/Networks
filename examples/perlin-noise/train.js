const generateTrainingData = require('./generate-training-data');
const generateImage = require('./generate-image');
const fs = require('fs');
const stringHash = require('string-hash');
const configFile = '/app/examples/perlin-noise/configs/'+process.env.CONFIG+'.json';

(async function(){
    const Network = require('../../Networks/Network');
  
    let batchSize = 128;

    let config = JSON.parse(fs.readFileSync(configFile,{encoding:'utf-8'}));
    let hash = stringHash(JSON.stringify(config));
    let c = new Network(config);
   
    const modelDir = '/app/models/perlin-noise/'+hash;
    const outputFile = '/app/outputs/'+hash+'.png';

    if(!fs.existsSync(modelDir)){
        fs.mkdirSync(modelDir,{recursive:true});
    }
    console.log('carregando modelo...');
    await c.load(modelDir);
    console.log('gerando dados de treinamento...');
    let trainingData = generateTrainingData(batchSize*100);
    await c.train(trainingData,1000,async function(epoch,epochs,loss,acc){
        console.log(`${epoch}/${epochs} loss:${loss}, accuracy:${acc}`);
        await c.save(modelDir);
        let bytes = await generateImage(c);
        let buffer = Buffer.from(bytes);
        fs.writeFileSync(outputFile,buffer,'binary');
    });
})();
