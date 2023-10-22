const {
  DEFAULT_FILE_NAME,
  TIME_RANGE,
  DEFAUL_FILE_NAME_DELINIATOR,
} = require("./constants");

function delay(callback, ms = 0) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(callback()), ms);
  });
}

function trim(string) {
  return (string ?? "")
    .trim()
    .split("\n")
    .map((s) => s.trim())
    .join(" ");
}

function withDate(obj) {
  const date = new Date().toString();
  return { date, ...obj };
}

function printObj(obj) {
  console.log("date:%o\nrepos:%O", obj.date, obj.repositories);
  return obj;
}

function getDateAgo(daysAgo = 0) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
}

const START_DATE_GETTER_BY_TIME_RANGE = {
  [TIME_RANGE.DAILY]: () => {
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    return date;
  },
  [TIME_RANGE.WEEKLY]: () => getDateAgo(7),
  [TIME_RANGE.MONTHLY]: () => getDateAgo(30),
};

const prependToGetFilename =
  (prefix) =>
  (filename = DEFAULT_FILE_NAME) =>
    [prefix, filename].join(DEFAUL_FILE_NAME_DELINIATOR);

const FILE_NAME_GETTER_BY_TIME_RANGE = {
  [TIME_RANGE.DAILY]: prependToGetFilename(TIME_RANGE.DAILY),
  [TIME_RANGE.WEEKLY]: prependToGetFilename(TIME_RANGE.WEEKLY),
  [TIME_RANGE.MONTHLY]: prependToGetFilename(TIME_RANGE.MONTHLY),
};

module.exports = {
  printObj,
  FILE_NAME_GETTER_BY_TIME_RANGE,
  START_DATE_GETTER_BY_TIME_RANGE,
  getDateAgo,
  withDate,
  trim,
  delay,
};
