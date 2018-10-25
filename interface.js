var async = require("async");
var colors = require( "colors");

var PddDatabase = require('./database');

var pdb = new PddDatabase();

function matchFilter(item,filter) {
	return (item.goods_name.lastIndexOf(filter.keyword) != -1)&& (item.goods_name.lastIndexOf(filter.filter) != -1);
}

function getShopSalesDaily() {
	 var promise = new Promise(function(resolve, reject) {
		 var filters = [];
		pdb.getFilter()
			.then(
				(filter) => {
					filters = filter;
					return pdb.getGoodsDetail();
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
}

getShopSalesDaily();