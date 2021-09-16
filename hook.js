var http = require('http')

const url = 'http://185.253.154.183:8888/login'

http.get(url, (resp) => {
  console.log('heuuu')
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
