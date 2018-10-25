var async = require("async");
var colors = require( "colors");
var network = require('./network');
var PddDatabase = require('./database');
var pdb = new PddDatabase();
const DELAY = 4000;


function test() {
        pdb.getMalls()
            .then(
                (mallInfo) => {return getMallsInfo(mallInfo);},
                (err) => {console.log(err);}
            ).then(
                () => {return pullGoodsDetail();},
                (err) => {console.log(err);}
            );
}

function pullMallsInfo(mall_id) {
   var promise = new Promise(function(resolve, reject) {
        network.getMallInfo(mall_id)
            .then((repos) => {
                pdb.updateMallInfo(repos)
                    .then(() => {setTimeout(()=>{resolve()},DELAY);},
                        (err) => {throw err;});
            })
            .catch((err) => {
                console.log(err);
                setTimeout(()=>{reject(err)},DELAY);
            });
    });
    return promise;
}

function pullMallsGoodsInfo(mall_id) {
   var promise = new Promise(function(resolve, reject) {
        network.getMallGoodsInfo(mall_id)
            .then((repos) => {
                console.log(repos.goods_list.length);
                pdb.addGoods(repos.goods_list,mall_id);
                setTimeout(()=>{resolve()},DELAY);
            })
            .catch((err) => {
                setTimeout(()=>{reject(err)},DELAY);
            });
    });
    return promise;    
}

function getMallsInfo(row) {
    var promise = new Promise(function(resolve, reject) {
        async.eachSeries(row, (item, callback) => { 
            // console.log(item);
            if(item.mall_name != null) {
                console.log(String('============> ' + item.mall_name).red);
            } else {
                console.log(String('============> ' + item.mall_id).red);
            }
            pullMallsInfo(item.mall_id)
            .then(
                () => {
                    pullMallsGoodsInfo(item.mall_id).then(
                        () => {callback()},
                        (err) => {
                            console.log(err);
                            callback();
                        }
                    );
                },
                (err) => {
                    console.log(err);
                    callback()
                }
            );
        }, err => {
            if(err){
                reject(err);
            } else {
                resolve();
            }
        });
    });
    return promise;  
}

function pullGoodsDetail() {
    getGoodsByFilter()
        .then(
            (result) => {getGoodDetail(result);},
            (err) => {console.log(err);})
            ;
}

function getGoodDetail(goodsList) {
    var promise = new Promise(function(resolve, reject) {
        async.eachSeries(goodsList, (item, callback) => {
            network.getGoodsInfo(item.goods_id)
            .then(
                (page) => {return pdb.savePage(page);},
                (err) => {
                    console.log(err);
                    setTimeout(()=>{callback();},DELAY);
                    
                }
            ).then(
                () => {setTimeout(()=>{callback();},DELAY);},
                (err) => {
                    console.log(err);
                    setTimeout(()=>{callback();},DELAY);
                }
            );
        });            
    });
    return promise;    
}

function getGoodsByFilter() {
    var promise = new Promise(function(resolve, reject) {
        var filters;
        var goodsByFilter = [];
        pdb.getFilter()
            .then((result) => {
                filters = result
                
                return pdb.getGoods();
            },
            (err) => {reject(err)})
            .then((result) => {
                console.log(filters);
                result.forEach((item,index) => {
                    filters.forEach((filter,index) => {
                        if((item.goods_name.lastIndexOf(filter.keyword) != -1)
                                && (item.goods_name.lastIndexOf(filter.filter) != -1)){
                            goodsByFilter.push(item);
                        }
                    });
                });
                
                resolve(goodsByFilter);
            },
            (err) => {reject(err);});;

    });
    return promise;
}
    
    
// test();

pullGoodsDetail();