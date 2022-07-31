const sharp = require('sharp');
const fs = require('fs');

module.exports = function(dir){
    if(!fs.existsSync(dir)){
        fs.mkdirSync(dir,{recursive: true});
    }

    return fs
        .readdirSync(config.enchanceDir)
        .map((img) => path.join(config.enchanceDir,img))
        .filter(function(img){
            try{
                sharp(img);
                return true;
            }
            catch(e){

            }
            return false;
        });
}