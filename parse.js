var fs = require('fs');
var request = require('request');


var detail = JSON.parse(fs.readFileSync('detail.json'));
var mainDir = "main";
var detailDir = "detail";
var skuDir = "sku";

function download(url,dir) {
	const last = url.lastIndexOf('/');
	const name = url.substr(last + 1);
	request("http:" + url).pipe(fs.createWriteStream(dir + "/" + name));
}

function download(url,dir,name) {
	const last = url.lastIndexOf('/');
	// const name = url.substr(last + 1);
	request("http:" + url).pipe(fs.createWriteStream(dir + "/" + name + ".jpg"));
}

function deleteall(path) {  
    var files = [];  
    if(fs.existsSync(path)) {  
        files = fs.readdirSync(path);  
        files.forEach(function(file, index) {  
            var curPath = path + "/" + file;  
            if(fs.statSync(curPath).isDirectory()) { // recurse  
                deleteall(curPath);  
            } else { // delete file  
                fs.unlinkSync(curPath);  
            }  
        });  
        fs.rmdirSync(path);  
    }  
}

function clear() {
	deleteall(mainDir);
	deleteall(detailDir);
	deleteall(skuDir);
}

// clear();

// 主图
// console.log(detail.goods.topGallery);
if (!fs.existsSync(mainDir)) {
	fs.mkdirSync(mainDir);
	for(var x in detail.goods.topGallery) {
		download(detail.goods.topGallery[x],mainDir,x);
	}
}


// 详情图
// console.log(detail.goods.detailGallery);
if (!fs.existsSync(detailDir)) {
	fs.mkdirSync(detailDir);
	
	for(var x in detail.goods.detailGallery) {
		download(detail.goods.detailGallery[x].url,detailDir,x);
	}
}


// sku
// console.log(detail.goods.skus);
if (!fs.existsSync(skuDir)) {
	fs.mkdirSync(skuDir);
	try {
		for(var x in detail.goods.skus) {
			// console.log(detail.goods.skus[x]);
			download(detail.goods.skus[x].thumbUrl,skuDir,detail.goods.skus[x].specs[0].spec_value);
		}
	} catch (err) {
		
	}
}

exports.download = function() {
  console.log('Hello World');
}