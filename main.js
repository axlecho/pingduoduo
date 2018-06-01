const {app, BrowserWindow} = require('electron');

//主进程
const ipc = require('electron').ipcMain;
const DATABASE_STRING = "data.db";


function createWindow () {   
	// 创建浏览器窗口
	win = new BrowserWindow({width: 800, height: 600})
  
    // 然后加载应用的 index.html。
    win.loadFile('index.html')
	win.webContents.openDevTools();
	
	
	ipc.on('require-data',(event, arg)=> {
		console.log(arg);
		// event.sender.send('get-data', 'adfasdfasdfadf');
		requireData(event);
	});
	
	ipc.on('show-detail',(event,arg) => {
		console.log(arg);
		detailWin = new BrowserWindow({width: 800, height: 1200});
		detailWin.loadURL('http://mobile.yangkeduo.com/goods.html?goods_id=' + arg);
	});
}




app.on('ready', createWindow)

function requireData(event) {
	var sqlite3 = require('sqlite3').verbose();
	var db = new sqlite3.Database(DATABASE_STRING);
	db.serialize(function() {
		db.all("select * from goods",function(err,res){  
        if(!err)  
          event.sender.send('get-data', JSON.stringify(res));
        else  
          console.log(err);  
		});
	});
}