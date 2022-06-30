const fs = require('fs');

function loadTrainingFile(path){
    let contents = fs.readFileSync(path,{encoding:'utf-8'});
    contents = contents.trim().split("\n").map(function(l){
        return l.split(',').map((v) => Number(v));
    });
    return contents.slice(0,10);
}

(async function(){
    const Network = require('../Networks/Network');
    const trainingDir = '/content/drive/MyDrive/ia-projects/perlin-noise/training';
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
    console.log('iniciando treinamento...');
    let c = new Network({
        inputs:4,
        outputs:1,
        optimizer:'sgd',
        loss:'absoluteDifference',
        testingSize:0.2,
        layers:4,
        inputUnits:8,
        hiddenUnits:128
    });
   
   
    while(true){
        /*
        trainingData = [
            {
                input:0,
                output:1
            },
            {
                input:1,
                output:0
            },
            {
                input:0,
                output:1
            },
            {
                input:1,
                output:0
            }
        ];*/
      
        await c.train(trainingData,100000,function(epoch,epochs,loss,acc){
            console.clear();
        //    if(epochs % 10 === 0){
                console.log(epoch+'/'+epochs+' - loss:'+loss.toFixed(8),' acurracy:'+acc.toFixed(8)+'%');
                console.log(c.predict([558602775,70368744177664000,9942244791,-6421869177]).join(',')); //0.027701058811065268
                console.log(c.predict([558602775,70368744177664000,-3911415917,7824417485]).join(',')); //0.008446003773397203
                console.log(c.predict([558602775,70368744177664000,-3322662403,7713845639]).join(',')); //0.019827566320744557
          //  }
        });
      //  console.log('and 0: ',await c.predict([1]));
    }
})();
