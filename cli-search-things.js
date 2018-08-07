const program = require('commander')
const {green, red, magenta, yellow} = require('colors')
const {Iot} = require('aws-sdk')

const iot = new Iot()

let ran = false

program
  .arguments('<tenantUUID>')
  .option('-t, --tag <tag>', 'Tag')
  .action(async (tenantUUID, {tag}) => {
    ran = true
    try {
      const start = Date.now()
      let queryString = `attributes.tenantUUID:${tenantUUID}`
      if (tag) {
        queryString = `${queryString} AND shadow.reported.tags:${tag}`
      }
      const {things, nextToken} = await iot.searchIndex({
        queryString,
        maxResults: 100
      }).promise()
      const end = Date.now()
      things.forEach(({thingName, shadow}) => {
        console.log(green('Name'), magenta(thingName), green('Tags'), magenta(JSON.parse(shadow).reported.tags.join(' ')))
      })
      console.log(yellow('Items'), green(things.length))
      if (nextToken) console.log(yellow('nextToken'), green(nextToken))
      console.log(yellow('Search took'), green(end - start), green('ms'))
    } catch (err) {
      console.error(err)
      process.exit(1)
    }
  }
  )
  .parse(process.argv)

if (!ran) {
  program.outputHelp(red)
  process.exit(1)
}
