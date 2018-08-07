const program = require('commander')
const {green, red, magenta} = require('colors')
const {v4} = require('uuid')
const {Iot, IotData} = require('aws-sdk')
const Chance = require('chance')

const iot = new Iot()
const iotData = new IotData({endpoint: 'a2n7tk1kp18wix.iot.us-east-1.amazonaws.com'})
const chance = new Chance()

let ran = false

program
  .option('-n, --num <num>', 'Number of Things, default: 1000', '1000')
  .action(async ({num}) => {
    ran = true
    const tenantUUID = v4()
    console.log(green('Tenant:'), magenta(tenantUUID))
    const thingGroupName = `test-${Math.random().toString(36).replace(/[^a-z]+/g, '')}`
    console.log(green('Thing Group:'), magenta(thingGroupName))
    ran = true
    const allTags = Array.from(new Array(20)).map(() => chance.word())
    try {
      const {thingGroupArn} = await iot.createThingGroup({
        thingGroupName
      }).promise()
      await Promise
        .all(
          Array.from(new Array(+num)).map(() => {
            return iot
              .createThing({
                thingName: v4(),
                attributePayload: {
                  attributes: {
                    tenantUUID
                  }
                }
              }).promise()
              .then(({thingName, thingArn}) => Promise.all([
                iot
                  .addThingToThingGroup({
                    thingGroupArn,
                    thingArn
                  }).promise(),
                iotData.updateThingShadow({
                  thingName,
                  payload: JSON.stringify({
                    state: {
                      reported: {
                        tags: Array.from(new Array(Math.round(Math.random() * 5))).map(() => allTags[Math.round(Math.random() * allTags.length)])
                          .filter((v, index, self) => self.indexOf(v) === index)
                      }
                    }
                  })
                }).promise()
              ])
              )
          }
          )
        )
      console.log(green('Tags'), magenta(allTags.join(' ')))
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
