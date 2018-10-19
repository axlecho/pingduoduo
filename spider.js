var async = require("async");
var network = require('./network');





function search() {
    var list = [ 
        "07077", 
    ];
    async.eachSeries(list, (item, callback) => {
        network.getAllSearchResult(item)	
            .then(function (repos) {
                console.log('item total: ' + repos.items.length);
                parseList(repos.items);
                callback();
            })
            .catch(function (err) {
                callback(err);
            });
    }, err => {
        if (err) console.error(err.message);
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

search();