var program = require('commander');
var colors = require( "colors");
var network = require('./network');

program
    .version('0.0.1')
		.option('-r, --rank', '查询排名')
		.option('-m, --market', '市场销量分析')
        .option('-k, --keyword <value>', '查询关键词',"")
        .option('-g, --goods_id <n>', '查询商品代码', parseInt)
		.option('-f, --filter <value>', '查询副关键词')
        .parse(process.argv);
   

console.log('  - %s cheese', program.keyword);
if (program.rank && program.goods_id) {
    goodsRanks(program.goods_id,program.keyword);
}

if (program.market) {
	console.log(program.filter);
	marketAnalysis(program.keyword);
}


function goodsRanks(goods_id,keyword) {
    network.getAllSearchResult(keyword,program.filter)	
        .then(function (repos) {
            console.log('item total: ' + repos.items.length);
            for(var i=0,length=repos.items.length;i<length;i++){
                console.log(repos.items[i].goods_id);
                if(goods_id === repos.items[i].goods_id) {
                    console.log('find!!!!  -- rank ' + String(i).red);
                    return;
                }
            }
            console.log('failed  -- rank ' + String(repos.items.length).red +　' + ');
        })
        .catch(function (err) {
            console.log(err);
        });
}

function  marketAnalysis(keyword) {
	var sum = 0;
	network.getAllSearchResult(keyword,program.filter)	
        .then(function (repos) {
            console.log('item total: ' + repos.items.length);
            for(var i=0,length=repos.items.length;i<length;i++){
                console.log(repos.items[i].goods_name + ': ' + repos.items[i].sales);
				sum += repos.items[i].sales;
            }
            console.log('total :' + String(sum).red);
        })
        .catch(function (err) {
            console.log(err);
        });	
}