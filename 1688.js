const rp = require('request-promise');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');


var HEADER = {
	'accept' : 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
	'accept-encoding' : 'gzip, deflate, br',
	'accept-language' : 'zh-CN,zh;q=0.9',
	'cookie' : 'cna=HXJLEwSntTMCAbfr/zRV7FvC; ali_ab=120.229.251.89.1524898733034.6; ali_beacon_id=120.229.251.229.1524988171535.051823.9; hng=CN%7Czh-CN%7CCNY%7C156; enc=q19Po0MFH4IUeWj2e4kI9CwqsWTbcojrdpfxHuCEWQitnD%2BW%2BICROfRxXxtLTit4fAHU%2FeBkyvULDL4QSP%2FyWg%3D%3D; lid=echo000001; ali_apache_track=c_mid=b2b-445329700bd2a1|c_lid=echo000001|c_ms=1; __last_loginid__=echo000001; _cn_slid_=4WOufwupq9; last_mid=b2b-445329700bd2a1; UM_distinctid=166beec3fac97-0512c488c15a71-43450521-1fa400-166beec3fadcb; h_keys="02036#20086#20008#%u661f%u5821%u6e38%u4e50%u573a#%u661f%u5821#%u661f%u5821%u5170%u535a%u57fa%u5c3c#16057#21311#21311\\\\#%u706b%u8f66%u5934%u8fde%u63a5%u78c1%u94c1%u6302%u94a9"; ad_prefer="2018/11/03 16:53:56"; JSESSIONID=B2xYTjc-wscanuQakEnupsJH17-Z0ZZP8R-fYCt; cookie2=1c074244b51f931ec77809120d0adbaf; t=a1a7457d39ffd9f6b44c558c6d0bc18f; _tb_token_=e3554437398ee; csg=7fc08616; ali_apache_tracktmp=c_w_signed=Y; LoginUmid=7KO0K%2BfISbodeqTXFKs6hfFZlCxW0A8HqMeLwkwExXvmkdAiNY8Cqw%3D%3D; tbsnid=O%2Bv1RUkTjoKf5Rkt6Jk7N1DXMrKQ7%2BEOWfV3iAvumA86sOlEpJKl9g%3D%3D; userID=X0Kv8zDfmLXOo6hxwwlW16qtvz76N1LognOdOBUTfzU6sOlEpJKl9g%3D%3D; userIDNum=hwmvwp58co3mkdAiNY8Cqw%3D%3D; _csrf_token=1541313326976; __rn_alert__=false; alicnweb=touch_tb_at%3D1541324811234%7Clastlogonid%3Decho000001%7ChomeIdttS%3D71797104872074941793903108282200306576%7ChomeIdttSAction%3Dtrue%7Cshow_inter_tips%3Dfalse; _tmp_ck_0=qsh5XaqhsAjeWWa7HoxFcNrSBuhlvcu4FTodviqeGcDqHW9fYCnLzFgdpgPywTNrMqkQFbTcCpzDCI1lQSzI24o%2BjmMrC3i9CT%2B9PIBsvb8gRmqvqvx00xZ6NiSRz8n1wzTRmS0bAsrceRGCpUYQUsCsnZj2VCbsjZxQ5m4zJ5ebWsOHp61vnxjPIziwX65AFpFzHSatMNP01uvMANpaaHKzm1BcNodSAhcwdB8t2q30%2B1zcFM8A1uIQNl%2Ba%2FiUDVfU0Tv1PrabYF1UtXv7%2FeTYYA3ozJEruDdH%2FZ1bb0vDpiHKeta1WyPs9Te2G9mMI%2FifukGnXqnnk41Zd%2B1MAL%2BzJhBBJYMb%2Bb2xo7Hx7MLdrzSyqrzwtT%2BJ1wXgTexN%2Belmt0Asnbafn3xXKovZ%2FcV%2F9aMiVggVyK9Kl0B16r19T%2FDLljiBrMBdL4SjVJakCK1Clwx1LZhxM1Aqm6YlUA0VeXk9gFzMiNd2NlECwYwfmgZZJndjBX7AEgmV3Ezix%2BhWw0P5Oxu6giqq1PnkYeQ%3D%3D; __cn_logon_id__=echo000001; __cn_logon__=true; isg=BFNTlRG6DKRUi8FK7o4kwtSV4te9oObwL2cIqwVwXnKzhHImjdiQGlKeupRPJD_C',
	'upgrade-insecure-requests' : '1',
	'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36'
}

var opt = {
    timeout: 60000,
	gzip:true,
    headers: HEADER,
}



		
		
function getSearchResult(page) {
	opt.uri = 'https://xingfantoys.1688.com/page/offerlist.htm?pageNum='  + page;
    return rp(opt);
}


getSearchResult(1)
	.then(
		(repo) => {
			repo = iconv.decode(repo,'gbk');
			// var $ = cheerio.load(body);
			console.log(repo)
		},
		(err) => {console.log(err.message)}
	);