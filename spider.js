var async = require("async");
var colors = require( "colors");
var network = require('./network');
var PddDatabase = require('./database');
var pdb = new PddDatabase();
const DELAY = 4000;


function test() {
    var target
    pdb.getTarget()
        .then(
            (row) => {return pdb.getMalls();},
            (err) => {console.log(err);}
        )
        .then(
            (mallInfo) => {getMallsInfo(target,mallInfo);},
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

function getMallsInfo(target,row) {
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
        if (err) console.error(err.message);
    });
}

test();