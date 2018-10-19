var sqlite3 = require('sqlite3');
var fs = require("fs");

var DATABASE_STRING = "data.db";

var db = new sqlite3.Database(DATABASE_STRING);
var exists = fs.existsSync(DATABASE_STRING);

function initDatabase() {
	if(exists) {
		return;
	}
	
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
}

exports.initDatabase = initDatabase;