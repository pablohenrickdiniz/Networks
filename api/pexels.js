const axios = require('axios');
const url = 'https://api.pexels.com/v1/curated';
let fails = 0;

module.exports = async function request(params){
    let time = Math.max(fails*5000,0);
    await new Promise(r => setTimeout(r, time));
    params = params || {};
    params.per_page = params.per_page || 20;
    params.page = params.page || 1;
    let items = [];
    try{
        let response = await axios.get(url,{
            params:params,
            headers:{
                'Authorization':'563492ad6f9170000100000123f6e6a6e95c4185878ee735255769ae'
            }
        });
        if(response.status === 200){
            if(response.data.constructor === {}.constructor && response.data.photos.constructor === [].constructor){
                items = response.data.photos;
                fails--;
            }
        }
        else{
            fails++;
        }
    }
    catch(e){
        if(fails < 0){
            fails = 0;
        }
        fails++;
    }

    return items;
}