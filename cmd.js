var program = require('commander');
var colors = require( "colors");
var fs = require('fs');
var async = require("async");
var network = require('./network');
const tool = require('./parse');
const DELAY = 4000;
program
    .version('0.0.1')
		.option('-r, --rank', '查询排名')
		.option('-m, --market', '市场销量分析')
        .option('--info <value>', '商品信息')
        .option('--file <value>', '市场分析文件')
        .option('-k, --keyword <value>', '查询关键词',"")
        .option('-g, --goods_id <n>', '查询商品代码', parseInt)
		.option('-f, --filter <value>', '查询副关键词',-1)
        .option('-d, --download <value>', '盗亦有道')
        .parse(process.argv);
   

console.log('  - %s cheese', program.keyword);
if (program.rank) {
    if(program.file) {
        goodsRanksFromFile(program.file);
    } else {
        goodsRanks(program.goods_id,program.keyword,program.filter);
    }
 
}

if (program.market) {
    if(program.file) {
        marketAnalysisFromFile(program.file);
    } else {
        marketAnalysis(program.keyword,program.filter);
    }
}

if (program.download) {
    download(program.download);
}

if (program.info) {
    network.getGoodsInfo(program.info)
        .then(
            (repo) => {
                console.log(repo);
            },
            (err) => {
                console.log(err);
            });
}

function goodsRanks(goods_id,keyword,filter) {
    goodsRanksInner(keyword,filter)
        .then(
            (repo)=>{
                console.log('item total: ' + repos.items.length);
                console.log('find!!!!  -- rank ' + String(repos.rank).red);
            },
            (err)=>{
                console.log(err);
            });
}

function goodsRanksInner(goods_id,keyword,filter) {
    
    var promise = new Promise(function(resolve, reject) {
        network.getAllSearchResult(keyword,filter)	
            .then(function (repos) {
                for(var i=0,length=repos.items.length;i<length;i++){
                    if(goods_id === repos.items[i].goods_id) {
                        repos.rank = i;
                        resolve(repos);
                        return;
                    }
                }
                reject('failed  -- rank ' + String(repos.items.length).green +　' + ');
            })
            .catch(function (err) {
                reject(err);
            });
    });
    return promise;
}

function goodsRanksFromFile(file) {
    var items = JSON.parse(fs.readFileSync(file,'utf-8'));
    console.log(items);
    async.eachSeries(items, (item, callback) => { 
        console.log('-k ' + item.keyword + ' -f ' + item.filter);
        goodsRanksInner(item.goods_id,item.keyword,null).then(
        (repos)=>{
            console.log('item total: ' + repos.items.length);
            console.log('find!!!!  -- rank ' + String(repos.rank).red);
            console.log('\n\n\n');
            setTimeout(()=>{callback()},DELAY);
        },
        (err)=>{
            console.log(err);
            console.log('\n\n\n');
            setTimeout(()=>{callback()},DELAY);
        });
    }, err => {
        if (err) console.error(err.message);
    });
}

function marketAnalysis(keyword,filter) {
    marketAnalysisInner(keyword,filter)
        .then(
        (repos)=>{
			    for(var i=0,length=repos.items.length;i<length;i++){
                    console.log(repos.items[i].goods_name + ': ' + repos.items[i].sales);
                    console.log('http://mobile.yangkeduo.com/goods.html?goods_id=' + repos.items[i].goods_id);
                }
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
            setTimeout(()=>{callback()},DELAY);
        },
        (err)=>{
            console.log(err);
            setTimeout(()=>{callback()},DELAY);
        });
    }, err => {
        if (err) console.error(err.message);
    });
}

function download(goods_id) {
    tool.download(goods_id);
}