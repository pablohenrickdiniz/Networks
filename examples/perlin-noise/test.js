const Network = require('../../Networks/Network');
(async function(){
    let net = new Network({
        inputShape:[2],
        outputShape:[3],
        layers:[
            "conv2d",
            "maxPooling2d"
        ]
    });
    net.summary();
    process.exit();

    let trainingData = [];
    for(let i = 0; i < 100;i++){
        let a = Math.random()*100;
        let b = Math.random()*100;
        let c = a+b;
        let d = a-b;
        trainingData.push({
            input:[a,b],
            output:[c,d]
        });
    }
    await net.train(trainingData,100,function(epoch,epochs,loss,acc){
        console.log(`${epoch}/${epochs} - loss:${loss}, acc:${acc}`);
    });
    console.log(net.predict([[1,9],[3,2],[3,8]]).arraySync());
    process.exit();
})();