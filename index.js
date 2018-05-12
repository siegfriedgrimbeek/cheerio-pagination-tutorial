// External dependencies
const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs')
const chalk = require('chalk')

const parsedResults = []
const resultsLimit = 10
const url = 'http://listverse.com/'
const outputFile = 'data.json'
let pageCounter = 0
let resultCount = 0

console.log(chalk.white.bgBlue(`\n  Scraping of ${chalk.underline.bold(url)} initiated...\n`))

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

    console.log(chalk.cyan(`  Scraping: ${nextPageLink}`))
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
  fs.writeFile(outputFile, JSON.stringify(parsedResults, null, 4), (err) => {
    if (err) {
      console.log(err)
      return false
    }
    console.log(chalk.white.bgBlue(`\n ${chalk.underline.bold(parsedResults.length)} Results exported successfully to ${chalk.underline.bold(outputFile)}\n`))
  })
}

getWebsiteContent(url)
