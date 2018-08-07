const program = require('commander')

program
  .command('generate-things', 'generate AWS IoT Things')
  .command('delete-things <group>', 'delete the group and its things')
  .command('search-things <tenantUUID>', 'search things for the given tenant')
  .parse(process.argv)
