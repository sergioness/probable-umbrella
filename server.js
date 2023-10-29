const http = require("node:http");
const { getTrendingReposFromCache } = require("./api");
const { TIME_RANGE } = require("./constants");

const HOSTNAME = "127.0.0.1";
const PORT = process.env.PORT;
let server;

function start() {
  server = http
    .createServer(async (req, res) => {
      const data = await getTrendingReposFromCache(TIME_RANGE.DAILY);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(data));
    })
    .listen(PORT, () => {
      console.log(`Server is running on http://${HOSTNAME}:${PORT}`);
    });
}

module.exports = { start };
