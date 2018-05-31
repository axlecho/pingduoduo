var http = require('http');
var sqlite3 = require('sqlite3');
var async = require("async");

var DATABASE_STRING = "data.db";

var db;
var info;

http.get("http://apiv3.yangkeduo.com/search?page=1&size=500&sort=_sales&q=%E7%8E%A9%E5%85%B7pdduid=5799600966", function(res) {
	console.log("Got response: " + res.statusCode);
	
	var data = [];
	res.on('data', function (response) {
		data.push(response);
	}); 
	
	res.on('end', function() {
		var body = JSON.parse(data.join(''));
		// console.log(body.items);
		info = body.items;
		init();
	});
}).on('error', function(e) {
	console.log("Got error: " + e.message);
});





function init() {
	db = new sqlite3.Database(DATABASE_STRING,function() {  
		db.run("create table goods (goods_id INT PRIMARY KEY NOT NULL,\
			goods_name TEXT NOT NULL,\
			sales INT NOT NULL\)",function(){
				save();
			});
	});
};

function save() {
	async.mapLimit(info, 20, async function(item) {
		const id = await saveItem(item)
		return id;
	}, (err, results) => {
		if (err) throw err
		// results is now an array of the response bodies
		// console.log(results)
	});
};


function saveItem(item) {
	const INSERT_STRING = 'INSERT INTO goods \
		(goods_id, goods_name, sales) \
		VALUES (' + item.goods_id + ',"' + item.goods_name + '",' + item.sales + ')';
	// console.log(INSERT_STRING);
	db.run(INSERT_STRING);
	
	console.log(item.goods_name);
	return item.goods_id;
}