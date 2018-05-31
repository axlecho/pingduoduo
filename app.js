var http = require('http');
var sqlite3 = require('sqlite3');
var DATABASE_STRING = "data.db";

http.get("http://apiv3.yangkeduo.com/search?page=1&size=10&sort=_sales&q=%E7%8E%A9%E5%85%B7pdduid=5799600966", function(res) {
	console.log("Got response: " + res.statusCode);
	
	var data = [];
	res.on('data', function (response) {
		data.push(response);
	}); 
	
	res.on('end', function() {
		var body = JSON.parse(data.join(''));
		console.log(body.items);
	});
}).on('error', function(e) {
	console.log("Got error: " + e.message);
});


init();


function init(info) {
	var db = new sqlite3.Database(DATABASE_STRING,function() {  
		db.run("create table good(id varchar(15))",function(){})
		save(db,info);
	});
};

function save(db,info) {
	
};


function saveItem(db,item) {
	
}