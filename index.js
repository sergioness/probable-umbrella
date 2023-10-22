require("dotenv").config();
const { JSDOM } = require("jsdom");
const { upload, download, hasLastUploadBeenValidSince } = require("./amazon");

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

async function getTrendingRepos(since) {
  const baseUrl = "https://github.com";
  const query = since ? `since=${since}` : "";
  const url = [`${baseUrl}/trending`, query].join("?");
  const response = await fetch(url);
  const html = await response.text();
  const dom = new JSDOM(html);
  const articles = dom.window.document.querySelectorAll("[data-hpc]>article");
  const repositories = [];
  for (const article of articles) {
    const anchor = article.querySelector("h2>a");
    const title = trim(anchor?.textContent);
    let url = anchor?.getAttribute("href");
    url = `${baseUrl}${url}`;
    const description = await delay(() =>
      trim(article.querySelector("p")?.textContent)
    );
    const programmingLanguage = trim(
      article.querySelector(`[itemprop="programmingLanguage"]`)?.textContent
    );
    const rawContributors = article.querySelectorAll(".avatar-user");
    const contributors = [];
    for (const rawContributor of rawContributors) {
      const name = rawContributor.getAttribute("alt").slice(1);
      const url = `${baseUrl}/${name}`;
      const contributor = { name, url };
      contributors.push(contributor);
    }
    const repository = {
      title,
      url,
      description,
      programmingLanguage,
      contributors,
    };
    repositories.push(repository);
  }
  return repositories;
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
  daily: () => {
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    return date;
  },
  weekly: () => getDateAgo(7),
  monthly: () => getDateAgo(30),
};

const DEFAULT_FILE_NAME = "data.json";

const FILE_NAME_GETTER_BY_TIME_RANGE = {
  daily: () => ["daily", DEFAULT_FILE_NAME].join("-"),
  weekly: () => ["weekly", DEFAULT_FILE_NAME].join("-"),
  monthly: () => ["monthly", DEFAULT_FILE_NAME].join("-"),
};

async function getTrendingReposFromCache(timeRange = "daily") {
  const filename = FILE_NAME_GETTER_BY_TIME_RANGE[timeRange]();
  const startDate = START_DATE_GETTER_BY_TIME_RANGE[timeRange]();
  const isLastUploadValid = await hasLastUploadBeenValidSince(
    filename,
    startDate
  );
  let file = null;
  if (isLastUploadValid) {
    console.log("downloading the last version of %s file...", filename);
    file = await download(filename);
  } else {
    console.log("uploading a new version of %s file...", filename);
    const repositories = await getTrendingRepos(timeRange);
    file = withDate({ repositories });
    await upload(file, filename);
  }
  return file;
}

getTrendingReposFromCache("daily").then(printObj);
