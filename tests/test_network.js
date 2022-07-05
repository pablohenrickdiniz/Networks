const fs = require('fs');

function loadTrainingFile(path){
    let contents = fs.readFileSync(path,{encoding:'utf-8'});
    contents = contents.trim().split("\n").map(function(l){
        return l.split(',').map((v) => Number(v));
    });
    return contents.slice(0,10000);
}

(async function(){
    const Network = require('../Networks/Network');
    const trainingDir = '/content/drive/MyDrive/ia-projects/perlin-noise/training';
    const modelDir = '/content/drive/MyDrive/ia-projects/perlin-noise/model';

    if(!fs.existsSync(modelDir)){
        fs.mkdirSync(modelDir,{recursive:true});
    }

    let files = fs.readdirSync(trainingDir);
    let trainingData = [];
    for(let i = 0; i < files.length;i++){
        let path = trainingDir+'/'+files[i];
        console.log('carregando arquivo '+path+'...');
        trainingData = trainingData.concat(loadTrainingFile(path,100000000));
    }
    trainingData = trainingData.map(function(l){
        return {
            input: l.slice(0,4),
            output: l[4]
        };
    });
    console.log('iniciando treinamento...')
    let c = new Network({
        inputs:4,
        outputs:1,
        optimizer:'sgd',
        loss:'meanSquaredError',
        testingSize:0.5,
        layers:1,
        hiddenUnits:8,
        outputActivation:'sigmoid'
    });
    await c.load(modelDir);
    await c.train(trainingData,100,function(epoch,epochs,loss,acc){
        console.log(`${epoch}/${epochs} loss:${loss}, accuracy:${acc}`);
        console.log(c.predict([145363311,500,1238425296,-5912340556]).join(',')); //0.5826214467245044
        await c.save(modelDir);
    });
    await c.save(modelDir);
})();
