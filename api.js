const { JSDOM } = require("jsdom");
const { upload, download, hasLastUploadBeenValidSince } = require("./amazon");
const {
  FILE_NAME_GETTER_BY_TIME_RANGE,
  START_DATE_GETTER_BY_TIME_RANGE,
  trim,
  delay,
  withDate,
} = require("./utils");

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
  const file = withDate({ repositories });
  return file;
}

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
    file = await getTrendingRepos(timeRange);
    await upload(file, filename);
  }
  return file;
}

module.exports = {
  getTrendingReposFromCache,
};
