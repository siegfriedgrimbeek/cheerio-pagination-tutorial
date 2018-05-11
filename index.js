// External dependencies
const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs')
const chalk = require('chalk')

const parsedResults = []
const resultsLimit = 1000
const url = 'http://listverse.com/'
let pageCounter = 0
let resultCount = 0

console.log(chalk.cyan(`\n  Scraping ${url} initiated...\n`))

const getWebsiteContent = async (url) => {
  try {
    const response = await axios.get(url)
    const $ = cheerio.load(response.data)

    // Pagination Elements Link
    const nextPageLink = $('.pagination').find('.curr').parent().next().find('a').attr('href')

    // New Lists
    $('.wrapper .main .new article').map((i, el) => {
      const count = resultCount++
      const title = $(el).find('a').attr('href')
      const url = $(el).find('h3').text()

      const metadata = {
        count: count,
        title: title,
        url: url
      }
      parsedResults.push(metadata)
    })

    pageCounter++

    console.log(chalk.green(`  Scraping page #${pageCounter}: ${nextPageLink}`))

    if (pageCounter === resultsLimit) {
      exportResults(parsedResults)
      return false
    }
    getWebsiteContent(nextPageLink)
  } catch (error) {
    exportResults(parsedResults)
    console.error(error)
  }
}

const exportResults = (parsedResults) => {
  fs.writeFile('output.json', JSON.stringify(parsedResults, null, 4), (err) => {
    if (err) {
      console.log(err)
      return false
    }
    console.log('File successfully written! - Check your project directory for the output.json file')
  })
}

getWebsiteContent(url)
