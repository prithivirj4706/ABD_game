const http = require('http');
http.createServer((req, res) => {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    console.log(body);
    res.writeHead(200);
    res.end();
  });
}).listen(8081);
console.log('Log server running on 8081');
