require("dotenv").config();

console.log(process.env.GREETING);

async function scrapePage() {
    const response = await fetch('https://github.com/trending');
    const html = await response.text();
    console.log(html);
    if (!response.ok) return console.error('Failed to delete');
}

scrapePage();