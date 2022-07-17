const optimizers = ['adam', 'adamax', 'aldagrad', 'rmsprop', 'sgd'];
const activations = ['elu', 'hardSigmoid', 'linear', 'mish', 'relu', 'relu6', 'selu', 'sigmoid', 'softmax', 'softplus', 'softsign', 'swish', 'tanh'];
const layers = ['conv2d', 'dense', 'dropout', 'elu', 'flatten', 'gru', 'layerNormalization', 'leakyReLU', 'lstm', 'maxPooling2d', 'prelu', 'reLU', 'reshape', 'simpleRNN', 'softmax', 'thresholdedReLU', 'upSampling2d'];
const losses = [
	'absoluteDifference',
	'cosineDistance', 
	'hingeLoss', 
	'huberLoss', 
	'logLoss', 
	'meanSquaredError'
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
	let total = groups.reduce(function(a,b){
		return a * b.length;
	},1);
	for(let i = 0; i < total;i++){
		callback(indexToPermutation(i,groups));
	}
}

function indexToPermutation(index,groups){
	let indexes = [];
	for(let i = 0; i < groups.length;i++){
		indexes.push(0);
	}
	let t = indexes.length-1
	while(index > 0){
		if(index >= groups[t].length){
			indexes[t] = index % groups[t].length;
			index = Math.floor(index  / groups[t].length);
			t--;
		}
		else{
			indexes[t] = index;
			index = 0;
		}
	}

	let perm = [];
	for(let i = 0; i < groups.length;i++){
		perm.push(groups[i][indexes[i]]);
	}
	return perm;
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
		let sizes = [];
		let filters = [];

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
			sizes = parseShape(l.size);
		}

		let _layer = {
			types: types,
			activations: activations,
			units: units,
			filters: filters,
			poolSizes: poolSizes,
			sizes: sizes,
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
		inputShape: config.inputShape,
		outputShape: config.outputShape,
		optimizers: parseOptimizers(config.optimizer),
		losses: parseLosses(config.loss),
		layers: parseLayers(config.layers)
	});
};

function initialize(self,data){
	let length = null;
	let groupsConfig = null;

	let getGroupsConfig = function(){
		if(groupsConfig === null){
			let layers = [];
			for(let i = 0; i < data.layers.length;i++){
				let layer = data.layers[i];
				let keys = Object.keys(layer);
				let l = [];
				for(let j = 0; j < keys.length;j++){
					let k = keys[j];
					l.push({
						key: k,
						values: layer[k]
					});
				}
				layers.push(l);
			}

			groupsConfig = [
				{
					key:'optimizer',
					values: data.optimizers
				},
				{
					key:'loss',
					values: data.losses
				},
				{
					key:'layers',
					values: layers
				}
			];
			
		}
		return [...groupsConfig];
	};

	let getItem = function(index){
		let groupsConfig = getGroupsConfig();
		
		let groups =  groupsConfig.reduce(function(a,b){
			let concat = [];
			if(b.key !== 'layers'){
				concat = [b.values];
			}
			else{
				concat = b.values.map(function(c){
					return c.map(function(d){
						return [d.values];
					}).reduce(function(e,f){
						return e.concat(f);
					},[]);
				}).reduce(function(g,h){
					return g.concat(h);
				},[]);
			}
			return a.concat(concat);
		},[]);

		let perm = indexToPermutation(index,groups);
		let config = {
			inputShape: data.inputShape,
			outputShape: data.outputShape
		};

		let j = 0;
		for(let i = 0; i < groupsConfig.length;i++){
			let g = groupsConfig[i];
			switch(g.key){
				case 'optimizer':
				case 'loss':
					config[g.key] = perm[j];
					j++;
					break;
				case 'layers':
					let layers = [];
					for(let k = 0; k < g.values.length;k++){
						let configLayer = g.values[k];
						let layer = {};
						for(let l = 0; l < configLayer.length;l++){
							switch(configLayer[l].key){
								case 'types':
									layer.type = perm[j];
									j++;
									break;
								case 'activations':
									layer.activation = perm[j];
									j++;
									break;
								case 'filters':
									layer.filters = perm[j];
									j++;
									break;
								case 'poolSizes':
									layer.poolSize = perm[j];
									j++;
									break;
								case 'sizes':
									layer.size = perm[j];
									j++;
									break;
							}
						}
						layers.push(layer);
					}
					config.layers = layers;
					break;
			}
		}

		return config;
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