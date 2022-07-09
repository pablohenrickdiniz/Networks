const generateTrainingData = require('./generate-training-data');
const generateImage = require('./generate-image');
const fs = require('fs');
const stringHash = require('string-hash');
const configFile = '/app/examples/perlin-noise/configs/'+process.env.CONFIG+'.json';

(async function(){
    const Network = require('../../Networks/Network');

    let config = JSON.parse(fs.readFileSync(configFile,{encoding:'utf-8'}));
    let hash = stringHash(JSON.stringify(config));
    let c = new Network(config);
   
    const modelDir = '/app/models/perlin-noise/'+hash;
    const outputFilePath = '/app/outputs/'+hash;

    if(!fs.existsSync(modelDir)){
        fs.mkdirSync(modelDir,{recursive:true});
    }
    console.log('carregando modelo...');
    await c.load(modelDir);
    console.log('gerando dados de treinamento...');
    let trainingData = generateTrainingData(config.batchSize*10);
    await c.train(trainingData,1000,async function(epoch,epochs,loss,acc){
        console.log(`${epoch}/${epochs} loss:${loss}, accuracy:${acc}`);
        await c.save(modelDir);
        if(epoch % 10 === 0){
            let outputFile = outputFilePath+'/'+epoch+'.png';
            fs.writeFileSync(outputFile,Buffer.from(await generateImage(c)),'binary');
        }
    });
})();
