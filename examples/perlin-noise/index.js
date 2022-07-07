function loadModel(callback){
    tf.loadLayersModel('model/model.json').then(callback);
}

function getContext(){
    let canvas = document.getElementById('canvas');
    return canvas.getContext('2d');
}

function predict2Color(predict){
    let colors = [];
    for(let i = 0; i < predict.length;i++){
        let tmp = [];
        for(let j = 0; j < predict[i].length;j++){
            tmp.push(Math.floor(predict[i][j]*255));
        }
        colors.push(tmp);
    }
    return colors;
}

function onload(){
    loadModel(function(m){
        let input = [];
        for(let i = 0; i < 600;i++){
            for(let j = 0; j < 600; j++){
                input.push([0,100,i,j]);
            }
        }
        let colors = predict2Color(m.predict(tf.tensor(input)).reshape([600,600]).arraySync());
        let ctx = getContext();
        for(let i = 0; i < colors.length;i++){
            for(let j = 0; j < colors[i].length;j++){
                let c = colors[i][j];
                ctx.fillStyle = `rgba(${c},${c},${c},1)`;
                ctx.fillRect(i,j,1,1);
            }
        }
    });
}