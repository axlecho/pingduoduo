var http = require('http');
var sqlite3 = require('sqlite3');
var async = require("async");
var fs = require("fs");
const {app, BrowserWindow} = require('electron');

var DATABASE_STRING = "data.db";
var exists = fs.existsSync(DATABASE_STRING);
var db = new sqlite3.Database(DATABASE_STRING);

var keyword = "合金车";
start(keyword);

function start(keyword){
	http.get("http://apiv3.yangkeduo.com/search?page=1&size=500&sort=_sales&q="+encodeURIComponent(keyword) + "&pdduid=5799600966", function(res) {
		console.log("Got response: " + res.statusCode);
		
		var data = [];
		res.on('data', function (response) {
			data.push(response);
		}); 
		
		res.on('end', function() {
			
			var body = JSON.parse(data.join(''));
			
			// console.log(body.items);
			init(body.items);
		});
	}).on('error', function(e) {
		console.log("Got error: " + e.message);
	});
}





function init(info) {
	db.serialize(function() {
		if(!exists) {
			db.run("create table goods (goods_id INT PRIMARY KEY NOT NULL,\
				goods_name TEXT NOT NULL,\
				sales INT NOT NULL,\
				hd_thumb_url TEXT NOT NULL,\
				price INT NOT NULL)");
				
			db.run("create table goods_sales(id INTEGER PRIMARY KEY AUTOINCREMENT,\
				goods_id INT NOT NULL,\
				op_time INT   NOT NULL,\
				op_sales INT NOT NULL)");
				
			db.run("create table goods_tags(id INTEGER PRIMARY KEY AUTOINCREMENT,\
				goods_id INT NOT NULL,\
				tags TEXT   NOT NULL)");
		}
		
		async.mapLimit(info, 20, async function(item) {
			const id = await saveItem(item)
			return id;
		}, (err, results) => {
			if (err) throw err
			
			console.log("deal with " + results.length + " items");
			// console.log(results);
			// app.quit();
		});
	});
	
	
};

function saveItem(item) {
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
			+ new Date().getTime() + ',' 
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
	});
	
	// console.log(item.goods_name);
	return item.goods_id;
}