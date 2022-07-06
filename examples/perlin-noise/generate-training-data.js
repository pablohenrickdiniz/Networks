const HeightMap = require('./HeightMap');
const max = Number.MAX_SAFE_INTEGER;
const stringHash = require('string-hash');

function randIndex(max){
    let sign = Math.round(Math.random()) === 1?1:-1;
    return Math.round(Math.random()*max*sign);
}

module.exports = function(num_examples){
    let examples = [];
    let existing = [];
    
    for(let i = 0; i < 100;i++){
        let iterations = 5 + Math.floor(Math.random()*50);
        let seed = Math.round(Math.random()*max*(Math.round(Math.random()) === 1?1:-1));
        let scale = Math.pow(2,iterations-1)*7.8125;
        let map = new HeightMap({
            seed:seed,
            iterations:iterations,
            scale:scale
        });

        while(examples.length < num_examples){
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
    }
    return examples;
};
    
