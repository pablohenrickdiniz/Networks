const NetworkGenerator = require('../../Networks/NetworkGenerator');
const tf = require('@tensorflow/tfjs-node-gpu');
let gen = new NetworkGenerator({
    inputShape:[128,128,3],
    outputShape:[2048,2048,3],
    layers:[
       {type:'conv2d',filters:'3|6|8|12|32',activation:'relu',poolSize:['1-2','1-2']},
        'maxPooling2d',
        'upSampling2d',
        {type:'conv2d',filters:'3|6|8|12|32',activation:'relu',poolSize:['1-2','1-2']},
        'maxPooling2d',
        'upSampling2d',
        {type:'conv2d',filters:'3|6|8|12|32',activation:'relu',poolSize:['1-2','1-2']},
        {type:'maxPooling2d'},
        {type:'upSampling2d'},
        {type:'conv2d',filters:'3|6|8|12|32',activation:'relu',poolSize:['1-2','1-2']},
        'maxPooling2d',
        'upSampling2d',
        {type:'conv2d',filters:3,activation:'relu',poolSize:['1-2','1-2']},
        'maxPooling2d'
    ],
    optimizer:'sgd',
    loss:'meanSquaredError'
});