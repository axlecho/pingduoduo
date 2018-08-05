const tool = require('./parse');

console.log(process.argv[2]);
tool.download(process.argv[2]);
