const Network = require("../../Networks/Network");

(async function(){
    let net = new Network({
        inputShape:[4],
        outputShape:[1],
        layers:[
            'conv2d'
        ]
    });
 

    let trainingData = [
        {
            input:[1,1,1,1],
            output:[4]
        },
        {
            input:[2,2,2,2],
            output:[8]
        },
        {
            input:[1,1,1,1],
            output:[4]
        },
    ];

    await net.train(trainingData,1000,function(epoch,epochs,loss,acc){
        console.log(`${epoch}/${epochs} - loss:${loss}, acc:${acc}`);
        console.log(net.predict([[2,2,2,2]]));
    });

    process.exit();
})();