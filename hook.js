var http = require('http')

const url = 'http://185.253.154.183:8888/test'

http.get(url, (resp) => {
  console.log('heuuu')
let data = '';
  // A chunk of data has been received.
  resp.on('data', (chunk) => {
    data += chunk;
  });

  // The whole response has been received. Print out the result.
  resp.on('end', () => {
    console.log(JSON.parse(data).explanation);
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});
