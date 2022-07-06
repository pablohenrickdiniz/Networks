const generateTrainingData = require('./generate-training-data');
const fs = require('fs');

(async function(){
    const Network = require('../../Networks/Network');
    const modelDir = '/content/drive/MyDrive/ia-projects/perlin-noise/training';

    if(!fs.existsSync(modelDir)){
        fs.mkdirSync(modelDir,{recursive:true});
    }

    let batchSize = 512;
    let c = new Network({
        inputs:4,
        outputs:1,
        optimizer:'sgd',
        loss:'meanSquaredError',
        testingSize:0.5,
        layers:1,
        hiddenUnits:8,
        outputActivation:'sigmoid',
        batchSize:batchSize
    });
    console.log('carregando modelo...');
    await c.load(modelDir);
    console.log('gerando dados de treinamento...');
    let trainingData = generateTrainingData(batchSize*1000);
    while(true){
        await c.train(trainingData,100,async function(epoch,epochs,loss,acc){
            console.log(`${epoch}/${epochs} loss:${loss}, accuracy:${acc}`);
            console.log(c.predict([145363311,500,1238425296,-5912340556]).join(',')); //0.5826214467245044
            await c.save(modelDir);
        });
        if(fs.existsSync('./stop.lock')){
            fs.unlinkSync('./stop.lock');
            process.exit();
        }
    }
})();
