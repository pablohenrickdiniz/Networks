const { model } = require('@tensorflow/tfjs');
const Network = require('../../Networks/Network');

let network = new Network({
    inputShape:[3],
    outputShape:[1]
});

let trainingData = [];
for(let i = 0; i < 100;i++){
    let a = Math.floor(Math.random()*100);
    let b = Math.floor(Math.random()*100);
    let c = Math.floor(Math.random()*100);
    trainingData.push({
        input:[a,b,c],
        output:a+b+c
    });
}

(async function(){
    await network.train(trainingData,100,function(epoch,epochs,loss,acc){
        console.log(`${epoch}/${epochs} - loss:${loss}, acc:${acc}`);
    });
    
    console.log(network.predict([[1,1,1]]));
})();