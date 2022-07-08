const HeightMap = require('./HeightMap');
const max = Number.MAX_SAFE_INTEGER;
const stringHash = require('string-hash');

function randIndex(max){
    let sign = Math.round(Math.random()) === 1?1:-1;
    return Math.round(Math.random()*max*sign);
}

function max_values(){
    let iterations = 5;
    let max_it = null;
    let max_scale = null;
    let scale = 0;
    while(scale < max){
        max_it = iterations;
        max_scale = scale;
        iterations++;
        scale = Math.pow(2,iterations-1)*7.8125;
    }
    return {
        iterations: max_it,
        scale: max_scale  
    };
}


module.exports = function(num_examples){
    let examples = [];
    let existing = [];
    let max_conf = max_values();
    while(examples.length < num_examples){
        let iterations = 5 + Math.floor(Math.random()*(max_conf.iterations-5));
        let seed = Math.round(Math.random()*max*(Math.round(Math.random()) === 1?1:-1));
        let scale = Math.pow(2,iterations-1)*7.8125;
        if(scale > max_conf.scale){
            continue;
        }
        let map = new HeightMap({
            seed:seed,
            iterations:iterations,
            scale:scale
        });
        let i = randIndex(max);
        let j = randIndex(max);
        let example = {
            input:[seed,scale,i,j],
            output:map.get(i,j)
        };
        let hash = stringHash(JSON.stringify(example));
        if(existing.indexOf(hash) === -1){
            existing.push(hash);
            examples.push(example);
        }
    }
    return examples;
};
    
