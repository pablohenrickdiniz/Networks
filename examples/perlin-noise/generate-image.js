
const tf = require('@tensorflow/tfjs-node');

module.exports = async function(model,options){
    options = options || {};
    let seed = options.seed || 0;
    let scale = options.scale || 100;
    let x = options.x || 0;
    let y = options.y || 0;
    let width = options.width || 1024
    let height = options.height || 1024;
    let input = [];
    for(let sy = y; sy < y + height;sy++){
        for(let sx = x; sx < x + width;sx++){
            input.push([seed,scale,sx,sy]);
        }
    }
    let output = tf.tensor(model.predict(input)).flatten().reshape([height,width]).arraySync();
    input = [];
    for(let sy = 0; sy < output.length; sy++){
        for(let sx = 0; sx < output[sy].length;sx++){
            let level = Math.min(Math.round(Math.abs(output[sy][sx])*255),255);
            output[sy][sx] = [level,level,level];
        }
    }
    return await tf.node.encodePng(tf.tensor(output));
};