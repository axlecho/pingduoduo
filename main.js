const {app, BrowserWindow} = require('electron');
const tool = require('./parse');

//主进程
const ipc = require('electron').ipcMain;
const DATABASE_STRING = "data.db";

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(DATABASE_STRING);

function createWindow () {   
	// 创建浏览器窗口
	win = new BrowserWindow({width: 800, height: 600})
  
    // 然后加载应用的 index.html。
    win.loadFile('index.html')
	win.webContents.openDevTools();
	
	
	ipc.on('require-data',(event, arg)=> {
		console.log(arg);
		// event.sender.send('get-data', 'adfasdfasdfadf');
		requireData(event,arg);
	});
	
	ipc.on('show-detail',(event,arg) => {
		// console.log(arg);
		detailWin = new BrowserWindow({width: 800, height: 1200});
		detailWin.loadURL('http://mobile.yangkeduo.com/goods.html?goods_id=' + arg);
	});
	
	ipc.on('get-goods-info',(event,arg) => {
		// console.log(arg);
		requireGoodsInfo(event,arg);
	});
	
	ipc.on('downloadPic',(event,arg) => {
		console.log(arg);
		download(event,arg);
	});
}

function requireData(event,arg) {
	db.serialize(function() {
		var SELERT_STR = 'select * from goods join goods_tags on goods.goods_id = goods_tags.goods_id where goods_tags.tags="' + arg + '" order by daily_up desc';
		// console.log(SELERT_STR);
		db.all(SELERT_STR,function(err,res){  
			if(!err)  
			  event.sender.send('get-data', JSON.stringify(res));
			else  
			  console.log(err);  
		});
	});
}

function requireGoodsInfo(event,goods_id) {
	db.serialize(function() {
		db.all("select * from goods_sales where goods_id=" + goods_id,function(err,res){  
        if(!err)  
          event.sender.send('good-info', JSON.stringify(res));
        else  
          console.log(err);  
		});
	});
}

function download(event,goods_id) {
	tool.download(goods_id);
}


app.on('ready', createWindow)


	