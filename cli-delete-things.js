const program = require('commander')
const {green, red, magenta} = require('colors')
const {Iot} = require('aws-sdk')

const iot = new Iot()

let ran = false

program
  .arguments('<group>')
  .action(async (thingGroupName) => {
    ran = true
    try {
      const {things} = await iot.listThingsInThingGroup({
        thingGroupName
      }).promise()
      await Promise.all(things.map(thingName => iot.deleteThing({thingName}).promise()))
      await iot.deleteThingGroup({thingGroupName}).promise()
      console.log(green('Deleted'), magenta(thingGroupName))
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
