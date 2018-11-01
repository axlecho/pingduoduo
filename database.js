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
module.exports = PddDatabase;






