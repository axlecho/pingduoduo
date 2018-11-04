var async = require("async");
var colors = require( "colors");

var PddDatabase = require('./database');

var pdb = new PddDatabase();

function matchFilter(item,filter) {
	return (item.goods_name.lastIndexOf(filter.keyword) != -1)&& (item.goods_name.lastIndexOf(filter.filter) != -1);
}

function getGoodsInfoDaily() {
    var date = new Date(new Date(new Date().toLocaleDateString()).getTime());
    pdb.getAllGoodsDetail()
        .then(
            (result) => {prinfByMall(result)},
            (err) => {console.log(err)}
        );
}

function prinfByFilter(result) {
    var today = new Date(new Date(new Date().toLocaleDateString()).getTime()).getTime();
    var yesterday = today - 24 * 60 * 60 * 1000;
    pdb.getFilter()
        .then(
            (filters) => {
                filters.forEach((filter) => {
                    console.log('==============> ' + filter.keyword + ' - ' + filter.filter);
                    var set = {};
                    result.forEach((item) => {
                        if(matchFilter(item,filter)) {
                            // console.log(item.time + ' ' + today + ' ' + yesterday);
                            if(set[item.goods_id]) {
                                // console.log(set[item.goods_id]);
                                // console.log(item);
                                if(set[item.goods_id].time == today && item.time == yesterday) {
                                    set[item.goods_id].one_day_sales = set[item.goods_id].cnt - item.cnt;
                                }
                            } else {
                                set[item.goods_id] = item;
                                set[item.goods_id].one_day_sales = -1; 
                            }
                        }
                    });
                    prinfSet(set); 
                });
            },
            (err) => {reject(err)}
        )
}

function prinfByMall(result) {
    var today = new Date(new Date(new Date().toLocaleDateString()).getTime()).getTime();
    var yesterday = today - 24 * 60 * 60 * 1000;
    pdb.getMalls()
        .then(
            (malls) => {
                malls.forEach((mall) => {
                    console.log('==============> ' + mall.mall_name);
                    var set = {};
                    result.forEach((item) => {
                        if(item.mall_id == mall.mall_id) {
                            if(set[item.goods_id]) {
                                // console.log(set[item.goods_id]);
                                // console.log(item);
                                if(set[item.goods_id].time == today && item.time == yesterday) {
                                    set[item.goods_id].one_day_sales = set[item.goods_id].cnt - item.cnt;
                                }
                            } else {
                                set[item.goods_id] = item;
                                set[item.goods_id].one_day_sales = -1; 
                            }
                        }
                    });
                    var array = Object.values(set);
					array.sort(function(a,b){return b.cnt - a.cnt});
                    // array.sort(function(a,b){return b.one_day_sales - a.one_day_sales});
                    prinfSet(array.slice(0,10));
                });
            },
            (err) => {console.log(err)}
        );            
}
function prinfSet(set) {
    var array = Object.values(set);
    array.sort(function(a,b){return b.one_day_sales - a.one_day_sales});
    array.forEach((item) => {
        if(item.mall_id == 8363337) {
           console.log(String(item.rank + '\t' + item.one_day_sales + '\t' + item.cnt + '\t' + item.mall_name + '\t' + item.goods_name).red);
        } else {
           console.log(String(item.rank + '\t' + item.one_day_sales + '\t' + item.cnt + '\t' + item.mall_name + '\t' + item.goods_name));
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