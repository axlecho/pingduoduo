const {app, BrowserWindow} = require('electron')

//主进程
const ipc = require('electron').ipcMain;


function createWindow () {   
	// 创建浏览器窗口
	win = new BrowserWindow({width: 800, height: 600})
  
    // 然后加载应用的 index.html。
    win.loadFile('index.html')
	win.webContents.openDevTools();
	
	
	ipc.on('require-data',(event, arg)=> {
		console.log(arg);
		event.sender.send('get-data', 'adfasdfasdfadf');
	});
}
  
app.on('ready', createWindow)