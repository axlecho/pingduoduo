var http = require('http');
var sqlite3 = require('sqlite3');
var async = require("async");
var fs = require("fs");
const {app, BrowserWindow} = require('electron');

var DATABASE_STRING = "data.db";
var exists = fs.existsSync(DATABASE_STRING);
var db = new sqlite3.Database(DATABASE_STRING);
const time = new Date().getTime();

run();


function run() {
 async.waterfall([
	(cb)=>{
		if(!exists) {
			initDatabase(cb);
		} else {
			cb(null);
		}},
	(cb)=>{start("玩具",cb);},
	(cb)=>{start("合金车",cb);},
	(cb)=>{start("兼容乐高",cb);},
	(cb)=>{start("救护车",cb);},
	(cb)=>{start("包包",cb);}],
	(err, result) =>{
		if (err) {
			console.log(err);
		} else {
			console.log('c:' + result)
		}
	});
}

function start(keyword,done){
	http.get("http://apiv3.yangkeduo.com/search?page=1&size=1000&sort=_sales&q="+encodeURIComponent(keyword) + "&pdduid=5799600966", function(res) {
		console.log("Got response: " + res.statusCode);
		
		var data = [];
		res.on('data', function (response) {
			data.push(response);
		}); 
		
		res.on('end', function() {
			
			var body = JSON.parse(data.join(''));
			
			// console.log(body.items);
			init(keyword,body.items,done);
		});
	}).on('error', function(e) {
		console.log("Got error: " + e.message);
	});
}



function initDatabase(done) {
	
	db.serialize(function() {
		db.run("create table goods (goods_id INT PRIMARY KEY NOT NULL,\
			goods_name TEXT NOT NULL,\
			sales INT NOT NULL,\
			hd_thumb_url TEXT NOT NULL,\
			price INT NOT NULL,\
			realtime_up INT,\
			daily_up INT,\
			threeday_up INT,\
			weekly_up INT)");
			
		db.run("create table goods_sales(id INTEGER PRIMARY KEY AUTOINCREMENT,\
			goods_id INT NOT NULL,\
			op_time INT   NOT NULL,\
			op_sales INT NOT NULL)");
			
		db.run("create table goods_tags(id INTEGER PRIMARY KEY AUTOINCREMENT,\
			goods_id INT NOT NULL UNIQUE,\
			tags TEXT   NOT NULL)");		
		
	});
	done();
}

function init(keyword,info,done) {
	var exists = fs.existsSync(DATABASE_STRING);
	db.serialize(function() {
		async.mapLimit(info, 50, async function(item) {
			const id = await saveItem(keyword,item)
			return id;
		}, (err, results) => {
			if (err) throw err
			
			console.log("deal with " + results.length + " items");
			// console.log(results);
			// app.quit();
			done();
		});
	});
	
	
};

function saveItem(keyword,item) {
	

	const INSERT_GOODS = 'INSERT INTO goods \
		(goods_id, goods_name, sales,hd_thumb_url,price) \
		VALUES (' + item.goods_id + ',' 
			+ '"' + item.goods_name + '",' 
			+ item.sales + ','
			+ '"' + item.hd_thumb_url + '",'
			+ item.price + ')';
	
	const INSERT_SALES = 'INSERT INTO goods_sales \
		(goods_id, op_time, op_sales) \
		VALUES (' + item.goods_id + ',' 
			+ time + ',' 
			+ item.sales + ')';
			
	const INSERT_TAGS = 'INSERT INTO goods_tags \
		(goods_id,tags) \
		VALUES (' + item.goods_id + ','
		+ '"' + keyword + '"' + ')';
		
	// console.log(INSERT_SALES);
	db.serialize(function() {
		db.run(INSERT_TAGS,()=>{});
		db.run(INSERT_GOODS,()=>{});
		db.run(INSERT_SALES);
		
		// console.log(time);
		// 计算增长量
		db.all("select op_time from goods_sales where op_time < " + time +　" order by op_time desc  limit 1 ",(err,res)=> {
			if(!err) {
				if(res !== undefined && res.length !== 0) {
						// console.log("select * from goods_sales where op_time=" + res[0].op_time  + " and goods_id=" + item.goods_id);
						db.all("select * from goods_sales where op_time=" + res[0].op_time  + " and goods_id=" + item.goods_id ,(err,res) => {  
						
							if(res !== undefined && res.length !== 0) {
								//console.log("=========");
								//console.log(item);
								//console.log(res[0]);
								//console.log("==========");
								
								// console.log("update goods set realtime_up = " + (item.sales - res[0].op_sales) + " where goods_id = " + item.goods_id);
								db.run("update goods set realtime_up = " + (item.sales - res[0].op_sales) + " where goods_id = " + item.goods_id);
							}

					});
				}
			} else  {
				console.log(err);  
			}
		});

		// 计算增长量
		db.all("select op_time from goods_sales where op_time < " + (time - 86400000) +　" order by op_time desc  limit 1 " ,(err,res)=> {
			// 	console.log(res[0].op_time);
			if(res !== undefined && res.length !== 0) {
					// console.log("select * from goods_sales where op_time=" + res[0].op_time  + " and goods_id=" + item.goods_id);
					db.all("select * from goods_sales where op_time=" + res[0].op_time  + " and goods_id=" + item.goods_id ,(err,res) => {  
					if(!err) {
						if(res !== undefined && res.length !== 0) {
							//console.log("=========");
							//console.log(item);
							//console.log(res[0]);
							//console.log("==========");
							db.run("update goods set daily_up = " + (item.sales - res[0].op_sales) + " where goods_id = " + item.goods_id);
						}
					} else  {
						console.log(err);  
					}
				});
			}
		});
		

		// 计算增长量
		db.all("select op_time from goods_sales where op_time < " + (time - 86400000 * 3) +　" order by op_time desc  limit 1 ",(err,res)=> {
			// 	console.log(res[0].op_time);
			if(res !== undefined && res.length !== 0) {
					// console.log("select * from goods_sales where op_time=" + res[0].op_time  + " and goods_id=" + item.goods_id);
					db.all("select * from goods_sales where op_time=" + res[0].op_time  + " and goods_id=" + item.goods_id ,(err,res) => {  
					if(!err) {
						if(res !== undefined && res.length !== 0) {
							//console.log("=========");
							//console.log(item);
							//console.log(res[0]);
							//console.log("==========");
							db.run("update goods set threeday_up = " + (item.sales - res[0].op_sales) + " where goods_id = " + item.goods_id);
						}
					} else  {
						console.log(err);  
					}
				});
			}
		});
				
		// 计算增长量
		db.all("select op_time from goods_sales where op_time < " + (time - 86400000 * 7) +　" order by op_time desc  limit 1 ",(err,res)=> {
			// 	console.log(res[0].op_time);
			if(res !== undefined && res.length !== 0) {
					// console.log("select * from goods_sales where op_time=" + res[0].op_time  + " and goods_id=" + item.goods_id);
					db.all("select * from goods_sales where op_time=" + res[0].op_time  + " and goods_id=" + item.goods_id ,(err,res) => {  
					if(!err) {
						if(res !== undefined && res.length !== 0) {
							//console.log("=========");
							//console.log(item);
							//console.log(res[0]);
							//console.log("==========");
							db.run("update goods set weekly_up = " + (item.sales - res[0].op_sales) + " where goods_id = " + item.goods_id);
						}
					} else  {
						console.log(err);  
					}
				});
			}
		});
	});
	
	// console.log(item.goods_name);
	return item.goods_id;
}



function calculate(time) {

}