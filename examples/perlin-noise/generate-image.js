
const tf = require('@tensorflow/tfjs-node-gpu');

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

    let output = tf.tensor(model.predict(input).flatten().arraySync().map((v) => [v,v,v]))
        .reshape([height,width,3])
        .abs()
        .mul(255)
        .round()
        .minimum(255)
        .maximum(0);

    return await tf.node.encodeJpeg(output);
};