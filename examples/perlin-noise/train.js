const generateTrainingData = require('./generate-training-data');
const generateImage = require('./generate-image');
const fs = require('fs');
const stringHash = require('string-hash');

(async function(){
    const Network = require('../../Networks/Network');
  
    let batchSize = 128;

    let config = {
        inputShape:[4],
        outputShape:[1],
        optimizer:'sgd',
        loss:'absoluteDifference',
        testingSize:0.5,
        batchSize:batchSize,
        layers:['dense','dense']
    };

    let c = new Network(config);
    
    const modelDir = '/app/models/perlin-noise/'+stringHash(JSON.stringify(config));
    const outputFile = modelDir+'/output.png';

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
