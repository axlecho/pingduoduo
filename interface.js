var async = require("async");
var colors = require( "colors");

var PddDatabase = require('./database');

var pdb = new PddDatabase();

function matchFilter(item,filter) {
	return (item.goods_name.lastIndexOf(filter.keyword) != -1)&& (item.goods_name.lastIndexOf(filter.filter) != -1);
}

function getGoodsInfoDaily() {
    var date = new Date(new Date(new Date().toLocaleDateString()).getTime());
    pdb.getGoodsDetailByDate(date)
        .then(
            (result) => {prinfByFilter(result)},
            (err) => {console.log(err)}
        );
}

function prinfByFilter(result) {
    pdb.getFilter()
        .then(
            (filters) => {
                filters.forEach((filter) => {
                    console.log('==============> ' + filter.keyword + ' - ' + filter.filter);
                    var set = [];
                    result.forEach((item) => {
                        if(matchFilter(item,filter)) {
                            set.push(item);
                        }
                    });
                    prinfSet(set); 
                });
            },
            (err) => {reject(err)}
        )    
}

function prinfSet(set) {
    set.sort(function(a,b){return b.cnt - a.cnt});
    set.forEach((item) => {
        if(item.mall_id == 8363337) {
           console.log(String(item.cnt + '\t' + item.mall_name + '\t' + item.goods_name).red);
        } else {
           console.log(String(item.cnt + '\t' + item.mall_name + '\t' + item.goods_name));
        }
        console.log('http://mobile.yangkeduo.com/goods.html?goods_id=' + item.goods_id); 
        
    });
    console.log('\n');
}

function getShopSalesDaily() {
	 var promise = new Promise(function(resolve, reject) {
		 var filters = [];
		pdb.getFilter()
			.then(
				(filter) => {
					filters = filter;
					return pdb.getAllGoodsDetail();
				},
				(err) => {reject(err)}
			)
			.then(
				(goodsInfo) => {
					filters.forEach((filter,index) => {
						console.log(filter);
						
						goodsInfo.forEach((item,index) => {
							// console.log(item);
							if(matchFilter(item,filter)) {
								console.log(item.goods_name + '\t' + item.cnt);
							}
						});
						console.log('\n\n\n\n');
					});
				},
				(err) => {reject(err)}
			);
	 });
     return promise;
}


getGoodsInfoDaily();