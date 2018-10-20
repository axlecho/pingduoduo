var program = require('commander');
var colors = require( "colors");
var fs = require('fs');
var async = require("async");
var network = require('./network');

program
    .version('0.0.1')
		.option('-r, --rank', '查询排名')
		.option('-m, --market', '市场销量分析')
        .option('--file <value>', '市场分析文件')
        .option('-k, --keyword <value>', '查询关键词',"")
        .option('-g, --goods_id <n>', '查询商品代码', parseInt)
		.option('-f, --filter <value>', '查询副关键词')
        .parse(process.argv);
   

console.log('  - %s cheese', program.keyword);
if (program.rank && program.goods_id) {
    goodsRanks(program.goods_id,program.keyword,program.filter);
}

if (program.market) {
    if(program.file) {
        marketAnalysisFromFile(program.file);
    } else {
        marketAnalysis(program.keyword,program.filter);
    }
}


function goodsRanks(goods_id,keyword,filter) {
    network.getAllSearchResult(keyword,filter)	
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

function marketAnalysis(keyword,filter) {
    marketAnalysisInner(keyword,filter)
        .then(
        (repos)=>{
            console.log('total items: ' + repos.items.length);
            console.log('total sales:' + String(repos.sum).red);
        },
        (err)=>{
            console.log(err);
        });
}

function  marketAnalysisInner(keyword,filter) {
    var promise = new Promise(function(resolve, reject) {
        console.log('-k ' + keyword + ' -f ' + filter);
        var sum = 0;
        network.getAllSearchResult(keyword,filter)	
            .then(function (repos) {
                repos.items.sort(function(a,b){return a.sales-b.sales});
                for(var i=0,length=repos.items.length;i<length;i++){
                    // console.log(repos.items[i].goods_name + ': ' + repos.items[i].sales);
                    // console.log('http://mobile.yangkeduo.com/goods.html?goods_id=' + repos.items[i].goods_id);
                    sum += repos.items[i].sales;
                }
                
                repos.sum = sum;
                resolve(repos);
            })
            .catch(function (err) {
                reject(err);
            });	
    });
    return promise;
}


function marketAnalysisFromFile(file) {
    var items = JSON.parse(fs.readFileSync(file,'utf-8'));
    console.log(items);
    async.eachSeries(items, (item, callback) => { 
        marketAnalysisInner(item.keyword,item.filter).then(
        (repos)=>{
            console.log('total items: ' + repos.items.length);
            console.log('total sales:' + repos.sum);
            console.log('\n\n\n');
            setTimeout(()=>{callback()},1000);
        },
        (err)=>{
            console.log(err);
            setTimeout(()=>{callback()},1000);
        });
    }, err => {
        if (err) console.error(err.message);
    });
}