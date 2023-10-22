require("dotenv").config();
const { getTrendingReposFromCache } = require("./api");
const { TIME_RANGE } = require("./constants");
const { printObj } = require("./utils");

getTrendingReposFromCache(TIME_RANGE.MONTHLY).then(printObj);
