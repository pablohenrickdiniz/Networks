const fs = require('fs');
const tf = require('@tensorflow/tfjs-node');
(async function(){
    let imageA = '/content/drive/MyDrive/ia-projects/resolution/images/pexels-photo-7191774.jpeg';
    let imageB = '/content/drive/MyDrive/ia-projects/resolution/outputs/0000_1010074764.jpeg';


    let pixelsA = tf.node.decodeImage(fs.readFileSync(imageA));
    let pixelsB = tf.node.decodeImage(fs.readFileSync(imageB));

    let res = tf.sub(pixelsA,pixelsB).abs().sum().arraySync();
    console.log(res);
})();