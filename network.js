const rp = require('request-promise');
const querystring = require('querystring');
const async = require("async");

const V = true;
const HOST = 'http://apiv3.yangkeduo.com';
const V4HOST = 'http://apiv4.yangkeduo.com';
const SEARCH_PATH = '/search?';
const GOODS_INFO_PATH = '/goods/';
const MAX_GOODS = 300;
const MAX_PAGE = 10;

var HEADER = {
            'User-Agent': 'android Mozilla/5.0 (Linux; Android 6.0.1; MuMu Build/V417IR; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/52.0.2743.100 Mobile Safari/537.36  phh_android_version/3.23.0 phh_android_build/228842 phh_android_channel/qihu360',
            'AccessToken': '',
            'Content-Type': 'application/json;charset=UTF-8',
            'Referer': 'Android',
            'Connection': 'Keep-Alive',
            'Accept-Encoding': 'gzip',
            'Cookie': 'Cookie: JSESSIONID=54D12CED20D5DECFA11A50F1F2E918BF; api_uid=rBUB7FvJWXIDxzmMbFeuAg=='
        }
        
var opt = {
    timeout: 60000,
    gzip: true,
    json: true,
    headers: HEADER,
    // proxy:'http://127.0.0.1:1080'
}

function test(url) {
	return rp(url);
}

/* Copy from Fidller
User-Agent: android Mozilla/5.0 (Linux; Android 6.0.1; MuMu Build/V417IR; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/52.0.2743.100 Mobile Safari/537.36  phh_android_version/3.23.0 phh_android_build/228842 phh_android_channel/qihu360
AccessToken: 
Content-Type: application/json;charset=UTF-8
Referer: Android
Host: apiv3.yangkeduo.com
Connection: Keep-Alive
Accept-Encoding: gzip
Cookie: JSESSIONID=422EF4DA565A63B93215065EBBD0C756; api_uid=rBQ5QVvIcOFKsjplBKT2Ag==
*/
function getSearchResult(word,page,size) {
    var param = querystring.stringify({
        q: word,
        page: page,
        size: size,
        requery: 1
    });
    
    opt.uri = HOST + SEARCH_PATH + param;
    if(V) {
        console.log(opt.uri);
    }
    return rp(opt);
}

function getAllSearchResult(word,filter) {
    var page = 1;
    var size = 25;
    var result = {
        total: 0,
        items: []
    }
    var promise = new Promise(function(resolve, reject) {
        async.whilst(
            function() {
                return true;
            },
            function(whileCb) {
                getSearchResult(word,page,size)
                    .then(function (repos) {
						
						var tmp = [];
						if(filter) {
							for(var i=0,length=repos.items.length;i<length;i++){
								if(repos.items[i].goods_name.lastIndexOf(filter) != -1) {
									tmp.push(repos.items[i]);
								}
							}
						} else {
							tmp = repos.items;
						}
						
                        if(V) {
                            console.log(page + ' items:' + tmp.length);
                        }
                        
                        result.total += tmp.length;
                        result.items = result.items.concat(tmp);
                        page ++;
                        
                        if(repos.items.length == 0 || page > MAX_PAGE || result.total > MAX_GOODS) {
                            whileCb("end");
                        } else {
                            whileCb();
                        }
                    })
                    .catch(function (err) {
                        whileCb(err);
                    });
                
            },
            function(err) {
                // console.log(err);
                
                if(err === 'end') {
                    
                } else {
                    console.log(err.message);
                }
                resolve(result);
            }
        );
    });
    return promise;
}


function getGoodsInfo(good_id) {
    opt.uri = V4HOST + GOODS_INFO_PATH + good_id;
    if(V) {
        console.log(opt.uri);
    }
    return rp(opt);
}

/*
test()
	.then(function (repos) {
		console.log(repos);
	})
	.catch(function (err) {
		// API call failed...
	});
*/

/*
getSearchResult('07077')
	.then(function (repos) {
		console.log(repos);
	})
	.catch(function (err) {
		console.log(err);
	});
*/

/*
getGoodsInfo(3379447083)
	.then(function (repos) {
		console.log(repos);
	})
	.catch(function (err) {
		console.log(err);
	});
*/

exports.getAllSearchResult = getAllSearchResult;
exports.getSearchResult = getSearchResult;
exports.getGoodsInfo = getGoodsInfo;
exports.test = test;