const axios = require('axios');
const url = 'https://pixabay.com/api/';
let fails = 0;

module.exports = async function request(params){
    let time = Math.max(fails*5000,0);
    await new Promise(r => setTimeout(r, time));
    params = params || {};
    params.per_page = params.per_page || 20;
    params.page = params.page || 1;
    params.order = 'latest';
    params.key = '27469962-3723ed577be347938e739409b';
    let items = [];
    try{
        let response = await axios.get(url,{
            params:params
        });
        if(response.status === 200){
            if(response.data.constructor === {}.constructor && response.data.hits.constructor === [].constructor){
                items = response.data.hits;
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