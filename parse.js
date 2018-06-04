var fs = require('fs');
var request = require('request');
var async = require("async");
var cheerio = require('cheerio');


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

function get(goods_id) {
	// var detail = JSON.parse(fs.readFileSync('detail.json'));
	var mainDir = "main";
	var detailDir = "detail";
	var skuDir = "sku";
	
	async.waterfall([
		(cb)=>{
			request('http://mobile.yangkeduo.com/goods.html?goods_id=' + goods_id, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					// console.log(body);
					
					// var str = "123";
					// console.log(body.search("window.rawData") != -1 );  // true
					
					var $ = cheerio.load(body);  
					$('html').find('script').each(function () {  
						var script = $(this).html();
						if(script.search("window.rawData") != -1) {
							var json = script.substring(script.indexOf("window.rawData=") + "window.rawData=".length);
							json = json.substring(0,json.lastIndexOf(";"));
							
							var info = JSON.parse(json);
							cb(null,info);
						}
					});
					
					// cb(new Error("获取商品信息失败"));
				} else {
					cb(new Error("获取商品信息失败"));
				}
			});
		},
		(detail,cb)=>{
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
		}],
		(err, result) =>{
			if (err) {
				console.log(err);
			} else {
				console.log('c:' + result)
			}
		}
	);
}

exports.download = function(goods_id) {
  get(goods_id);
}