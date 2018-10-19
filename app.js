var http = require('http');
var sqlite3 = require('sqlite3');
var async = require("async");
var fs = require("fs");
// const {app, BrowserWindow} = require('electron');

var DATABASE_STRING = "data.db";
var exists = fs.existsSync(DATABASE_STRING);
var db = new sqlite3.Database(DATABASE_STRING);
const time = new Date().getTime();

// run();
start("07077",()=>{});

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

var antiStr = "0ajeJyNj09Lw0AUxN9r7cWbB0+CLHhpUZPdbjbZZ09SUaG2IgbbmzRpYtOsyaYN9c/ZD+4e/AAyMIfhNzCDAIAL6GAKx5gfrdvWXvm+GEYedxI+wCGuu9D96UIvgVPcnAgudai1JE6RJKkuhZKkFREF0MOygwBnaFhIlKd5oEjk6VBmESWustJaEPFgSBIOsMYv59Z5D5sOpLDH7W5afxfGLH3lcdafF9Wq/tixWcyE2zNiLgiDEfsMgwG7ttZk8yyZFK2vZOTJkPUn9/H04YKZoszYXZaW9YCN19v6PfNDcn9kQJEnOGfPy3y5Lf5qcI67/sKuGmPHjeG0qVS8MfHrTD3W9kbMdLF/eSufqmpymyQObv8N/wKgW1jw";
function start(keyword,done){
	int req = "http://apiv3.yangkeduo.com/search?page=1&size=1000&sort=_sales&q=" + encodeURIComponent(keyword) + "&anti_content=" + encodeURIComponent(antiStr);

	console.log("req: " + req);

	http.get(req, function(res) {
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