var async = require("async");
var network = require('./network');
var PddDatabase = require('./database');
var pdb = new PddDatabase();
const DELAY = 4000;

function test() {
    pdb.getMalls()
    .then((row) => {
        getMallsInfo(row);
    },(err) => {
        console.log(err);
    });
}

function getMallsInfo(row) {
    async.eachSeries(row, (item, callback) => { 
        console.log(item);
        if(item.mall_name != null) {
            console.log('  ==> ' + item.mall_name);
        } else {
            console.log('  ==> ' + item.mall_id);
        }
        
        network.getMallInfo(item.mall_id)
            .then((repos) => {
                pdb.updateMallInfo(repos)
                    .then(() => {setTimeout(()=>{callback()},DELAY);},
                        (err) => {throw err;});
            })
            .catch((err) => {
                console.log(err);
                setTimeout(()=>{callback()},DELAY);
            });
        
    }, err => {
        if (err) console.error(err.message);
    });
}

test();