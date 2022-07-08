const Network = require('../../Networks/Network');

let network = new Network({
    inputShape:[2],
    outputShape:[1],
    layers: ['lstm','gru','simpleRNN']
});

network.summary();