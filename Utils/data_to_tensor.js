function data_to_tensor(data,length){
    let tx = tf.buffer([1,length]);
    for(let i = 0; i < data.length;i++){
        tx.set(data[i],i,0);
    }
    return tx.toTensor();
}

module.exports = data_to_tensor;