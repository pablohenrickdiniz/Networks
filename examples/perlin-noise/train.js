const generateTrainingData = require('./generate-training-data');
const fs = require('fs');
const stringHash = require('string-hash');

(async function(){
    const Network = require('../../Networks/Network');
  
    let batchSize = 512;

    let config = {
        inputs:4,
        outputs:1,
        optimizer:'sgd',
        loss:'meanSquaredError',
        testingSize:0.5,
        layers:1,
        hiddenUnits:8,
        outputActivation:'sigmoid',
        batchSize:batchSize
    };

    let c = new Network(config);

    //const modelDir = '/content/drive/MyDrive/ia-projects/perlin-noise/model';
    const modelDir = './model';

    if(!fs.existsSync(modelDir)){
        fs.mkdirSync(modelDir,{recursive:true});
    }

    console.log('carregando modelo...');
    await c.load(modelDir);
    console.log('gerando dados de treinamento...');
    let trainingData = generateTrainingData(batchSize*1000);
    await c.train(trainingData,1000,async function(epoch,epochs,loss,acc){
        console.log(`${epoch}/${epochs} loss:${loss}, accuracy:${acc}`);
        await c.save(modelDir);
        if(fs.existsSync('./stop.lock')){
            fs.unlinkSync('./stop.lock');
            process.exit();
        }
    });
})();
