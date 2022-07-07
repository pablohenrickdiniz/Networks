const width = 1200;
const height = 600;

let toDraw = [];
let intervals = [];
let time = 15000;

function loadModel(success,error,finish){
    let promise =  tf.loadLayersModel('model/model.json');
    if(success){
        promise = promise.then(success);
    }

    if(error){
        promise = promise.catch(error);
    }

    if(finish){
        promise = promise.finally(finish);
    }
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

function refresh(){
    loadModel(function(m){
        if(toDraw.length === 0){
            let input = [];
            for(let i = 0; i < width;i++){
                for(let j = 0; j < height; j++){
                    input.push([0,100,i,j]);
                }
            }
            let colors = predict2Color(m.predict(tf.tensor(input)).reshape([width,height]).arraySync());
            for(let i = 0; i < colors.length;i++){
                for(let j = 0; j < colors[i].length;j++){
                    toDraw.push([i,j,colors[i][j]]);
                }
            }
        }
        setTimeout(function(){
            refresh();
        },5000);
    },function(){
        setTimeout(function(){
            refresh();
        },5000);
    });
}

function onload(){
    draw();
}

function clearIntervals(){
    while(intervals.length > 0){
        clearInterval(intervals.pop());
    }
}

function draw(){
    clearIntervals();
    let ctx = getContext();
    loadModel(function(model){
        for(let i = 0; i < width;i++){
            let input = [];
            for(let j = 0; j < height;j++){
                input.push([0, 100, i, j]);
            }
            let interval = setTimeout(function(){
                let r = model.predict(tf.tensor(input)).reshape([height]).arraySync();
                for(let k = 0; k < r.length;k++){
                    let c = Math.floor(r[k]*255);
                    ctx.fillStyle = `rgba(${c},${c},${c},${r[k]})`;
                    ctx.fillRect(i,k,1,1);
                }
            },Math.random()*time);
            intervals.push(interval);
        }
        setTimeout(function(){
            draw();
        },time);
    },function(){
        setTimeout(function(){
            draw();
        },time);
    });
}