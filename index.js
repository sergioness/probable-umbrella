require("dotenv").config();
const { JSDOM } = require("jsdom");

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

function getFormattedDate(unformattedDate) {
    const date = new Date(unformattedDate);

    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const formattedDate = `${day.toString().padStart(2, '0')}.${month.toString().padStart(2, '0')}.${year}`;

    return formattedDate;
}

async function getData(since = "daily") {
    const trendingRepos = await getTrendingRepos(since);
    const trendingReposByDate = withDate(trendingRepos);

    console.log(trendingReposByDate);

    const date = getFormattedDate(trendingReposByDate.date);
    const repositories = trendingReposByDate.repositories;

    let repositoriesBlock = ``;

    const maxRepositoriesToDisplay = Math.min(repositories.length, 10)

    for (let i = 0; i < maxRepositoriesToDisplay; i++) {
        let contributorsBlock = `|`;
        repositories[i].contributors.forEach(contributor => contributorsBlock += `<a href='${contributor.url}'><u> ${contributor.name} </u></a> |`);

        const programmingLanguageBlock = `\nProgramming language: ${repositories[i].programmingLanguage || 'not using'}\n${contributorsBlock}\n\n`;
        const titleBlock = `<b>[${i+1}]   ${repositories[i].title}\n</b>`;
        const descriptionBlock = `${repositories[i].description}`;
        const titleAndDescriptionBlock = `${titleBlock}<a href='${repositories[i].url}'>${descriptionBlock || 'click to get more info'}</a>`;
        const repositoryBlock = `${titleAndDescriptionBlock}${programmingLanguageBlock}`;

        repositoriesBlock += repositoryBlock;
    }

    const message = {
        header: `<b>Github Repositories ${since} Trends</b>\n\n`,
        content: repositoriesBlock,
        date: `\n<i>Date: ${String(date)}</i>`
    }

    let result = `${message.header}${message.content}${message.date}`;
    return result;
}

module.exports = {
    getData
}