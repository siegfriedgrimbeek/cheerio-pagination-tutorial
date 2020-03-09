// External dependencies
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const chalk = require("chalk");

const url = "http://listverse.com/";
const outputFile = "data.json";
const parsedResults = [];
const pageLimit = 10;
let pageCounter = 0;
let resultCount = 0;

console.log(
  chalk.yellow.bgBlue(
    `\n  Scraping of ${chalk.underline.bold(url)} initiated...\n`
  )
);

const getWebsiteContent = async url => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // New Lists
    $(".wrapper .main .new article").map((i, el) => {
      const count = resultCount++;
      const url = $(el)
        .find("a")
        .attr("href");
      const title = $(el)
        .find("h3")
        .text();
      const metadata = {
        count: count,
        title: title,
        url: url
      };
      parsedResults.push(metadata);
    });

    // Pagination Elements Link
    const nextPageLink = $(".pagination")
      .find(".curr")
      .parent()
      .next()
      .find("a")
      .attr("href");
    console.log(chalk.cyan(`  Scraping: ${nextPageLink}`));
    pageCounter++;

    if (pageCounter === pageLimit) {
      exportResults(parsedResults);
      return false;
    }

    getWebsiteContent(nextPageLink);
  } catch (error) {
    exportResults(parsedResults);
    console.error(error);
  }
};

const exportResults = parsedResults => {
  fs.writeFile(outputFile, JSON.stringify(parsedResults, null, 4), err => {
    if (err) {
      console.log(err);
    }
    console.log(
      chalk.yellow.bgBlue(
        `\n ${chalk.underline.bold(
          parsedResults.length
        )} Results exported successfully to ${chalk.underline.bold(
          outputFile
        )}\n`
      )
    );
  });
};

getWebsiteContent(url);
