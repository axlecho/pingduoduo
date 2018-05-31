var http = require('http');

http.get("http://apiv3.yangkeduo.com/search?page=1&size=10&sort=_sales&q=%E7%8E%A9%E5%85%B7pdduid=5799600966", function(res) {
	console.log("Got response: " + res.statusCode);
	
	var data = [];
	res.on('data', function (response) {
		data.push(response);
	}); 
	
	res.on('end', function() {
		var body = JSON.parse(data.join(''));
		console.log(body.items);
	});
}).on('error', function(e) {
	console.log("Got error: " + e.message);
});


function save(info) {
	
}