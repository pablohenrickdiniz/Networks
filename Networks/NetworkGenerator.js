const optimizers = ['adadelta', 'adam', 'adamax', 'aldagrad', 'momentum', 'rmsprop', 'sgd'];
const activations = ['elu', 'hardSigmoid', 'linear', 'mish', 'relu', 'relu6', 'selu', 'sigmoid', 'softmax', 'softplus', 'softsign', 'swish', 'tanh'];
const layers = ['conv2d', 'dense', 'dropout', 'elu', 'flatten', 'gru', 'layerNormalization', 'leakyReLU', 'lstm', 'maxPooling2d', 'prelu', 'reLU', 'reshape', 'simpleRNN', 'softmax', 'thresholdedReLU', 'upSampling2d'];
const numericFields = ['filters','units'];
const losses = [];

function parseOptimizers(text){
	return parseList(text,optimizers);
}

function parseActivations(text){
	return parseList(text,activations);
}

function parseLayersTypes(text){
	return parseList(text,layers);
}

function parseList(text,list){
	text = String(text).split('|');
	if(text.indexOf('*') !== -1){
		return [...list].sort();
	}
    return [...new Set(text.filter((o) => list.indexOf(o) !== -1).sort())];
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

function parseShape(shape){
	shape = [...new Set(shape)];
	let shapes = [];

	if(shape.length > 0){
		let tmp = [];
		let indexes = [];
		for(let i = 0; i < shape.length;i++){
			let numbers = parseNumeric(shape[i]);
			tmp.push(numbers);
			indexes.push(0);
		}

		let total = tmp.reduce(function(a,b){
			return a * b.length;
		},1);

		let last = indexes.length - 1;
		
		for(let i = 0; i < total;i++){
			let shape = [];
			for(let j = 0; j < indexes.length;j++){
				shape.push(tmp[indexes[j]]);
			}
			shapes.push(shape);
			indexes[indexes.length-1]++;
			for(let j = last; j >= 0; j--){
				if(indexes[j] >= tmp[j].length){
					indexes[j] = 0;
					let prev = j-1;
					if(prev >= 0){
						indexes[prev]++;
					}
				}
			}
		}
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

		lrs.push({
			types: types,
			activations: activations,
			units: units,
			filters: filters,
			poolSizes: poolSizes,
			kernelSizes: kernelSizes,
			strides: strides,
			rates: rates,
			targetShapes: targetShapes
		});
	}

	return lrs;
}

let NetworkGenerator  = function(config){
   let self = this;
   self.data = {
   		optimizer: parseOptimizers(config.optimizer),
   		loss: parseLosses(config.loss),
   		layers: parseLayers(config.layers)
   };	
};




module.exports = NetworkGenerator;