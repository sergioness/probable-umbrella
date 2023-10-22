require("dotenv").config();
const { JSDOM } = require("jsdom");
const { upload } = require("./amazon");

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

async function getTrendingRepos(since = "daily") {
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

function withDate(repositories) {
  const date = new Date().toString();
  return { date, repositories };
}

getTrendingRepos("daily")
  .then(withDate)
  .then((obj) => {
    console.log("date:%o\nrepos:%O", obj.date, obj.repositories);
    return obj;
  })
  .then((json) => upload(json, "data.json"))
  .then(console.log);
