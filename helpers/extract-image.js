const prepare = require('./prepare-image');
module.exports = async function(img,left,top,width,height){
    return await prepare(
        img.clone().extract({left:left,top:top,width:width,height:height})
    );
}