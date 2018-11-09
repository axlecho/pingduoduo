var async = require('async');
var sqlite3 = require('sqlite3');
var fs = require('fs');

var DATABASE_STRING = 'data.db';
var db = new sqlite3.Database(DATABASE_STRING);
var exists = fs.existsSync(DATABASE_STRING);

class PddDatabase {
    constructor() {
        if(exists) {
            return;
        }
    }

    initDatabase() {
        db.serialize(function() {
            db.run('create table goods (goods_id INT PRIMARY KEY NOT NULL,\
                goods_name TEXT NOT NULL,\
                sales INT NOT NULL,\
                hd_thumb_url TEXT NOT NULL,\
                price INT NOT NULL,\
                realtime_up INT,\
                daily_up INT,\
                threeday_up INT,\
                weekly_up INT)');
                
            db.run('create table goods_sales(id INTEGER PRIMARY KEY AUTOINCREMENT,\
                goods_id INT NOT NULL,\
                op_time INT   NOT NULL,\
                op_sales INT NOT NULL)');
                
            db.run('create table goods_tags(id INTEGER PRIMARY KEY AUTOINCREMENT,\
                goods_id INT NOT NULL UNIQUE,\
                tags TEXT   NOT NULL)');		
            
        });
    }
    
    getMalls() {
        var promise = new Promise(function(resolve, reject) {
            db.serialize(function() {
                db.all('select * from mall',function(err,row){
                    if(null != err) {
                        reject(err);
                        return;
                    }
                    
                    resolve(row);
                });
            });
        });
        return promise;
    }
    
    getFilter() {
        var promise = new Promise(function(resolve, reject) {
            db.serialize(function() {
                db.all('select * from target',function(err,row){
                    if(null != err) {
                        reject(err);
                        return;
                    }
                    
                    resolve(row);
                });
            });
        });
        return promise;
    }
    
    getGoods() {
        var promise = new Promise(function(resolve, reject) {
            db.serialize(function() {
                db.all('select * from goods',function(err,row){
                    if(null != err) {
                        reject(err);
                        return;
                    }
                    
                    resolve(row);
                });
            });
        });
        return promise;
    }
    

    getGoodsDetailByDate(date) {
        return this.getGoodsDetail('where time=' + date.getTime());
    }

    getAllGoodsDetail() {
        return this.getGoodsDetail('order by time desc');
	}

    
    getGoodsDetail(reg) {
        var promise = new Promise(function(resolve, reject) {
            db.serialize(function() {
                db.all('select * from goods_detail join mall on goods_detail.mall_id = mall.mall_id ' + reg ,function(err,row){
                    if(null != err) {
                        reject(err);
                        return;
                    }
                    
                    resolve(row);
                });
            });
        });
        return promise;
	}

    updateMallInfo(mallInfo) {
        var promise = new Promise(function(resolve,reject) {
            db.serialize(function() {
                db.run('UPDATE mall set mall_name = ?,goods_num = ?,logo = ?,mall_sales = ? where mall_id = ?'
                    ,mallInfo.mall_name,mallInfo.goods_num,mallInfo.logo,mallInfo.mall_sales,mallInfo.mall_id,
                    (err) => {
                        if(err) {
                            reject(err) 
                        } else {
                            resolve();
                        }
                    });
            });
        });
        return promise;
    }

    addGoods(goodsList,mall_id) {
        var promise = new Promise(function(resolve,reject) {
            async.eachSeries(goodsList, (item, callback) => {
                var cnt = 0;
                if(item.cnt != 0) {
                    cnt = item.cnt;  
                }               
                db.serialize(function() {
                    db.run('INSERT INTO goods(goods_id,goods_name,cnt,mall_id) VALUES (?,?,?,?);', [item.goods_id,item.goods_name,cnt,mall_id], 
                    (err) => {
                        if(err) {
                            db.run('UPDATE goods set goods_name=?,mall_id=?,cnt=? where goods_id =?',[item.goods_name,mall_id,cnt,item.goods_id],
                                (err) => {
                                    if(err) {console.log(err.Error);}
                                    callback();
                                });
                        } else {
                            callback();
                        }
                    });
                });
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
    
    savePage(page) {
        var date = new Date(new Date(new Date().toLocaleDateString()).getTime());
            
        var promise = new Promise(function(resolve,reject) {
            db.serialize(function() {
                db.run('INSERT INTO goods_detail(goods_id,cnt,sku,main_gallery,detail_gallery,time,goods_name,rank,mall_id) VALUES (?,?,?,?,?,?,?,?,?);', 
                    [page.goods_id,page.sales,JSON.stringify(page.sku),page.hd_thumb_url,page.hd_thumb_url,date,page.goods_name,page.rank,page.mall_id], 
                    (err) => {
                        if(err) {
							console.log('update ==>  ' + page.goods_id);
                            // console.log(page);
                            db.run('UPDATE goods_detail set cnt=?,sku=?,main_gallery=?,detail_gallery=?,goods_name=?,rank=?,mall_id=? where goods_id =? and time=?',
                                [page.sales,
									JSON.stringify(page.sku),
									page.hd_thumb_url,
									page.hd_thumb_url,
									page.goods_name,
									page.rank,
									page.mall_id,
									page.goods_id,
									date],
                                (err) => {
                                    if(err) {
										console.log(err);
                                        reject(err);
                                    } else {
                                        resolve();
                                    }
                                });
                        } else {
                            resolve();
                        }
                    });
            });            
        });
        return promise;
    }
    
    test() {
        db.all('select * from mall',function(err,row){
            console.log(JSON.stringify(row));
        })
    }
}

/*
var pddDatabase = new PddDatabase();
pddDatabase.getMalls()
    .then((row) => {
        console.log(row);
    },(err) => {
        console.log(err);
    });
*/

/*
var pddDatabase = new PddDatabase();
pddDatabase.getTarget()
    .then((row) => {
        console.log(row);
    },(err) => {
        console.log(err);
    });
 */
 
var currentime = -1;
function getCurrentTime() {
    var promise = new Promise(function(resolve, reject) {  
        db.all('select distinct(time) from goods_detail order by time desc limit 1',
            (err,row) => {
                if(null != err) {
                    reject(err);
                    return;
                }
                
                resolve(row);
            });
        });
    return promise;    
}

function getAllSrcGoods() {
    var promise = new Promise(function(resolve, reject) {  
        db.all('select * from goods_src',
            (err,row) => {
                if(null != err) {
                    reject(err);
                    return;
                }
                
                resolve(row);
            });
        });
    return promise;  
}

function updateSrc(src_item) {
    var promise = new Promise(function(resolve, reject) { 
        db.serialize(function() {
            db.run('UPDATE goods_src set total_sale=?,oneday_sale=?,mall_on_sale=? where id =?',
                [src_item.total_sale,src_item.oneday_sale,src_item.mall_on_sale,src_item.id],
                (err) => {
                    if(err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });                    
        });
    })
}

function calculate(src_item) {
    var sgood_id = src_item.goods_id.replace(/^[A-Z]+|[A-Z]+$/g,'');
    var sbrand = src_item.brand.replace(/^[A-Z]+|[A-Z]+$/g,'');
    console.log('===========>  ' + sgood_id + '\t' + sbrand); 
    var promise = new Promise(function(resolve, reject) { 
        db.serialize(function() {
            db.all("select * from goods_detail where goods_name like '%" + sgood_id + "%'",
                (err,row) => {
                    // console.log(err);
                    if(err) {
                        reject(err);
                        return;
                    }
                    
                    console.log('item total  ' + row.length);
                    var mall_set = {};
                    var goods_set = {};
                    
                    for(var i = 0;i < row.length;i ++) {
                        if(row[i].goods_name.lastIndexOf(sbrand) != -1) {
                            if(row[i].time == currentime) {
                                console.log(row[i].goods_name);
                                src_item.total_sale += row[i].cnt;
                                if(mall_set[row[i].mall_id] === undefined) {
                                    src_item.mall_on_sale ++;
                                    mall_set[row[i].mall_id] = true;
                                }
                            }
                            
                            if(goods_set[row[i].goods_id] === undefined) {
                                goods_set[row[i].goods_id] = [];
                            }
                            goods_set[row[i].goods_id].push(row[i]);
                        }
                    }
                    
                    var yesterday = currentime - 24 * 60 * 60 * 1000;
                    for(var index in goods_set) {
                        var today_goods;
                        var yesterday_goods;
                        for(var i = 0;i < goods_set[index].length;i ++) {
                            if(goods_set[index][i].time === currentime) {
                                today_goods = goods_set[index][i];
                            }
                            
                            if(goods_set[index][i].time === yesterday) {
                                yesterday_goods = goods_set[index][i];
                            }
                        }
                        // console.log(today_goods.time + '\t' + yesterday_goods.time);
                        // console.log(today_goods.cnt + '\t' + yesterday_goods.cnt);
                        if(today_goods && yesterday_goods) {
                            src_item.oneday_sale += today_goods.cnt - yesterday_goods.cnt;
                        }  
                    }
                    
                    
                    resolve();
                });                    
        });
    });
    return promise;
}

function updateGoods_src() {
    
    getCurrentTime()
        .then(
            (result) => {
                currentime = result[0].time;
                return getAllSrcGoods();
            },
            (err) => {console.log(err)}
        )
        .then(
            (row) => {
                async.eachSeries(row, (src_item, callback) => { 
                    src_item.total_sale = 0;
                    src_item.oneday_sale = 0;
                    src_item.mall_on_sale = 0;
                    // callback();
                    calculate(src_item)
                        .then(
                            () => {return updateSrc(src_item)}
                        ).then(
                            () => {callback()}
                        ).catch (
                            (err) => { 
                                console(err);
                                callback();
                            }
                        )
                            
                });          
            },
            (err) => {console.log(err)}
        )
}

    updateGoods_src();



module.exports = PddDatabase;






