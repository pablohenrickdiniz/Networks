const optimizers = ['adadelta', 'adam', 'adamax', 'aldagrad', 'momentum', 'rmsprop', 'sgd'];
const activations = ['elu', 'hardSigmoid', 'linear', 'mish', 'relu', 'relu6', 'selu', 'sigmoid', 'softmax', 'softplus', 'softsign', 'swish', 'tanh'];
const layers = ['conv2d', 'dense', 'dropout', 'elu', 'flatten', 'gru', 'layerNormalization', 'leakyReLU', 'lstm', 'maxPooling2d', 'prelu', 'reLU', 'reshape', 'simpleRNN', 'softmax', 'thresholdedReLU', 'upSampling2d'];
const losses = [
	'absoluteDifference',
	'computeWeightedLoss', 
	'cosineDistance', 
	'hingeLoss', 
	'huberLoss', 
	'logLoss', 
	'meanSquaredError', 
	'sigmoidCrossEntropy', 
	'softmaxCrossEntropy'
];

function parseOptimizers(text){
	return parseList(text,optimizers,'sgd');
}

function parseActivations(text){
	return parseList(text,activations,'linear');
}

function parseLayersTypes(text){
	return parseList(text,layers,'dense');
}

function parseLosses(text){
	return parseList(text,losses,'meanSquaredError');
}

function parseList(text,list,def){
	text = String(text).split('|');
	if(text.indexOf('*') !== -1){
		return [...list].sort();
	}
    list =  [...new Set(text.filter((o) => list.indexOf(o) !== -1).sort())];
	if(list.length === 0){
		list = [def];
	}
	return list;
}

function parseNumeric(text){
	if(text === undefined){
		return [];
	}

	let numbers = String(text).split('|').map(function(t){
		let m = t.match(/^(\d+)$/);
		if(m && m[1] !== undefined){
			return [parseInt(m[1])];
		}
		m = t.match(/^(\d+)\-(\d+)$/);
		if(m && m[1] !== undefined && m[2] !== undefined){
			let a = parseInt(m[1]);
			let b = parseInt(m[2]);
			let min = Math.min(a,b);
			let max = Math.max(a,b);
			let tmp = [];
			for(let s = min; s <= max; s++){
				tmp.push(s);
			}
			return tmp;
		}
		return [];
	}).reduce(function(a,b){
		return a.concat(b);
	},[]);
	numbers = [...new Set(numbers)];
	return numbers.sort((a,b) => a-b);
}

function iterateOverPermutations(groups,callback){
	let indexes = [];
	for(let i = 0; i < groups.length;i++){
		indexes.push(0);
	}
	let total = groups.reduce(function(a,b){
		return a * b.length;
	},1);
	let last = indexes.length - 1;
	for(let i = 0; i < total;i++){
		let perm = [];
		for(let j = 0; j < indexes.length;j++){
			perm.push(groups[j][indexes[j]]);
		}
		callback(perm,i);
		indexes[indexes.length-1]++;
		for(let j = last; j >= 0; j--){
			if(indexes[j] >= groups[j].length){
				indexes[j] = 0;
				let prev = j-1;
				if(prev >= 0){
					indexes[prev]++;
				}
			}
		}
	}
}

function parseShape(shape){
	let shapes = [];
	if(shape && shape.constructor === [].constructor){
		let tmp = [];
		for(let i = 0; i < shape.length;i++){
			let numbers = parseNumeric(shape[i]);
			tmp.push(numbers);
		}
		iterateOverPermutations(tmp,function(perm,index){
			shapes.push(perm);
		});
	}
	return shapes;
}

function parseLayers(_layers){
	let lrs = [];

	for(let i = 0; i < _layers.length;i++){
		let l = _layers[i];
		let types = [];
		let activations = [];
		let units = [];
		let poolSizes = [];
		let kernelSizes = [];
		let strides = [];
		let rates = [];
		let targetShapes = [];

		if(typeof l === 'string'){
			types = parseLayersTypes(l);
		}
		else if(l.constructor === {}.constructor){
 			types = parseLayersTypes(l.type);
            activations = parseActivations(l.activation);
            units = parseNumeric(l.units);
            filters =  parseNumeric(l.filters);
 			poolSizes = parseShape(l.poolSize);
   			kernelSizes = parseNumeric(l.kernelSize);
  			strides = parseNumeric(l.strides);
           	rates = parseNumeric(l.rate);
          	targetShapes = parseShape(l.targetShape);
		}

		let _layer = {
			types: types,
			activations: activations,
			units: units,
			filters: filters,
			poolSizes: poolSizes,
			kernelSizes: kernelSizes,
			strides: strides,
			rates: rates,
			targetShapes: targetShapes
		};

		Object.keys(_layer).forEach(function(k){
			if(_layer[k].length === 0){
				delete _layer[k];
			}
		});
		
		lrs.push(_layer);
	}
	
	return lrs;
}

let NetworkGenerator  = function(config){
    initialize(this,{
		optimizers: parseOptimizers(config.optimizer),
		losses: parseLosses(config.loss),
		layers: parseLayers(config.layers)
	});
};

function initialize(self,data){
	let length = null;

	let getItem = function(index){

	};

	Object.defineProperty(self,'length',{
		get:function(){
			if(length === null){
				length = data.optimizers.length*data.losses.length*data.layers.reduce(function(a,b){
					let keys = Object.keys(b);
					let prod = 1;
					for(let i = 0; i < keys.length;i++){
						prod *= b[keys[i]].length;
					}
					return a*prod;
				},1);
			}	
			return length;	
		}
	});

	Object.defineProperty(self,'getItem',{
		get:function(){
			return getItem;
		}
	});
}



module.exports = NetworkGenerator;