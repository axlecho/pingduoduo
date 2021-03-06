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


var excludeSpecial = function(s) {    
    // 去掉转义字符    
    s = s.replace(/[\'\"\\\/\b\f\n\r\t]/g, '');    
    // 去掉特殊字符    
    s = s.replace(/[\@\#\$\%\^\&\*\{\}\:\"\L\<\>\?]/);    
    return s;    
 };  
 
 
function get(goods_id) {
	// var detail = JSON.parse(fs.readFileSync('detail.initDataObj.json'));
	
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
			
			if (!fs.existsSync("./data/")) {
				fs.mkdirSync("./data/");
			}
			
			var root = "./data/" +  excludeSpecial(detail.initDataObj.goods.goodsName) + "/";
			if (!fs.existsSync(root)) {
				fs.mkdirSync(root);
			} else {
				return;
			}
			
			// 主图
			// console.log(detail.initDataObj.goods.topGallery);
			if (!fs.existsSync(root + mainDir)) {
				fs.mkdirSync(root + mainDir);
				for(var x in detail.initDataObj.goods.topGallery) {
					download(detail.initDataObj.goods.topGallery[x],root + mainDir,x);
				}
			}


			// 详情图
			// console.log(detail.initDataObj.goods.detailGallery);
			if (!fs.existsSync(root + detailDir)) {
				fs.mkdirSync(root + detailDir);
				
				for(var x in detail.initDataObj.goods.detailGallery) {
					download(detail.initDataObj.goods.detailGallery[x].url,root + detailDir,x);
				}
			}


			// sku
			// console.log(detail.initDataObj.goods.skus);
			if (!fs.existsSync(root + skuDir)) {
				fs.mkdirSync(root + skuDir);
				try {
					for(var x in detail.initDataObj.goods.skus) {
						// console.log(detail.initDataObj.goods.skus[x]);
						download(detail.initDataObj.goods.skus[x].thumbUrl,root + skuDir,detail.initDataObj.goods.skus[x].specs[0].spec_value);
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