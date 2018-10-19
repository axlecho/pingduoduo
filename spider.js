var async = require("async");
var network = require('./network');





function search(item,callback) {
    network.getAllSearchResult(item)	
        .then(function (repos) {
            console.log('item total: ' + repos.items.length);
            parseList(repos.items);
            callback();
        })
        .catch(function (err) {
            callback(err);
        });
}

function parseList(items) {
    async.eachSeries(items, (item, callback) => { 
        console.log(item.goods_name);
        callback();
    }, err => {
        if (err) console.error(err.message);
    });   
}

var list = [ 
    "手机",
    "07077",
    "瓦力"
];

async.eachSeries(list, (item, callback) => {
    search(item,callback);
}, err => {
    if (err) console.error(err.message);
});