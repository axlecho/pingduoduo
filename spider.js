var async = require("async");
var colors = require( "colors");
var network = require('./network');
var PddDatabase = require('./database');
var pdb = new PddDatabase();
const DELAY = 4000;


function start() {
	pdb.getMalls()
		.then(
			(mallInfo) => {return pullAllMallsInfo(mallInfo);},
			(err) => {console.log(err);}
		).then(
			() => {return pullGoodsDetail();},
			(err) => {console.log(err);}
		);
}

function test() {
	getMallsInfoBySearch();
}	

function pullAllMallsInfo(row) {
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
					() => { return pullMallsGoodsInfo(item.mall_id)},
					(err) => {
						console.log(err);
						setTimeout(()=>{callback()},DELAY);
					}
				).then(
					() => {callback()},
					(err) => {
						console.log(err);
						setTimeout(()=>{callback()},DELAY);
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

function pullMallsInfo(mall_id) {
   var promise = new Promise(function(resolve, reject) {
        network.getMallInfo(mall_id)
            .then(
				(repos) => {return pdb.updateMallInfo(repos)},
				(err) => {reject(err)}
			)
			.then(
				() => {resolve()},
                (err) => {reject(err)}
			)
    });
    return promise;
}

function pullMallsGoodsInfo(mall_id) {
   var promise = new Promise(function(resolve, reject) {
        network.getMallGoodsInfo(mall_id)
            .then(
				(repos) => {
					console.log(repos.goods_list.length);
					return pdb.addGoods(repos.goods_list,mall_id);			
				},
				(err) => {console.log(err)}
			)
			.then(
				() => {setTimeout(()=>{resolve()},DELAY)},
				(err) => { console.log(err)}
			)
            .catch((err) => {
                setTimeout(()=>{reject(err)},DELAY);
            });
    });
    return promise;    
}



function pullGoodsDetail() {
	var promise = new Promise(function(resolve, reject) {
		pdb.getFilter()
			.then(
				(result) => {return pullGoodsRank(result)},
				(err) => {reject(err)}
			)
			.then(
				(result) => {return getGoodsByFilter(result)},
				(err) => {reject(err)}
			)    
			.then(
				(result) => {return getGoodDetail(result)},
				(err) => {reject(err)}
			).then(
				() => {resolve()},
				(err) => {reject(err)}
			);
	});
	return  promise;
}

function pullGoodsRank(filters) {
    var promise = new Promise(function(resolve, reject) {
        async.eachSeries(filters, (filter, callback) => { 
             network.getAllSearchResult(filter.keyword,null)	
                .then(function (repos) {
                    var goods_list = [];
                    for( var i = 0;i < repos.items.length;i++){
                        goods_list.push(repos.items[i].goods_id);
                    }
                    filter.goods_list = goods_list;
                    // console.log(filter.goods_list);
                    setTimeout(()=>{callback();},DELAY);
                })
                .catch(function (err) {
                    console.log(err);
                    setTimeout(()=>{callback();},DELAY);
                });
        }, (err) => {
            if(err) {
                reject(err)
            } else {
                resolve(filters);
            }
        });
    });
    return promise; 
}

function getGoodsByFilter(filters) {
    var promise = new Promise(function(resolve, reject) {
        // var goodsByFilter = [];  
        pdb.getGoods()
            .then((result) => {
                result.forEach((item,index) => {
                    filters.forEach((filter,index) => {
                        if((item.goods_name.lastIndexOf(filter.keyword) != -1)
                                && (item.goods_name.lastIndexOf(filter.filter) != -1)){
							item.rank = filter.goods_list.indexOf(item.goods_id);
                            // console.log(item.rank);
                            //goodsByFilter.push(item);
                        }  
                    });
                });
                resolve(result);
            },
            (err) => {reject(err);});;

    });
    return promise;
}

function getGoodDetail(goodsList) {
    var promise = new Promise(function(resolve, reject) {
        async.eachSeries(goodsList, (item, callback) => {
            network.getGoodsInfo(item.goods_id)
            .then(
                (page) => {
                    page.rank = item.rank;
                    // console.log(item.rank);
                    return pdb.savePage(page);
                }
            ).then(
                () => {setTimeout(()=>{callback()},DELAY - 2000);}
            ).catch (
                (err) => {
                    console.log(err);
                    setTimeout(()=>{callback()},DELAY - 2000);
                });
        },(err) => {
			if(err) {
				reject(err);
			} else {
				resolve(err);
			}
		});            
    });
    return promise;    
}

function getMallsInfoBySearch() {
	var promise = new Promise(function(resolve, reject) {
		network.getAllSearchResult('乐拼',null)
			.then(
				(repo) => {
					// console.log(repo);
					return getMallInfoByGood(repo.items)
				},
				(err) => {reject(err)}
			)
			.then(
				() => {console.log('done')},
				(err) => {console.log(err)}
			);
	});
	return promise;
}

function getMallInfoByGood(repo) {
    var promise = new Promise(function(resolve, reject) {
        async.eachSeries(repo, (item, callback) => {
			// console.log(item.goods_id);
            network.getGoodsInfo(item.goods_id)
            .then(
                (page) => {return page.mall_id}
            ).then(
                (mall_id) => {return network.getMallInfo(mall_id)}
            ).then(
				(repo) => {
					console.log(repo.mall_id + ' ' + repo.mall_name + ' ' + repo.goods_num);
					setTimeout(()=>{callback()},DELAY - 2000)
				}
			).catch (
                (err) => {
                    console.log(err.message);
                    setTimeout(()=>{callback()},DELAY - 2000);
                }
			);
        },(err) => {
			if(err) {
				reject(err);
			} else {
				resolve();
			}
		});            
    });
    return promise;  
}
	

test();