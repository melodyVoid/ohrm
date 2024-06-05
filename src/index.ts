import { program } from 'commander'
import PKG from '../package.json'
import * as actions from './actions'

program.version(PKG.version, '-v --version')

program
  .command('ls')
  .description('List all the registries')
  .action(actions.onList)

program
  .command('current')
  .option('-u, --show-url', 'Show the registry URL instead of the name')
  .description('Show current registry name or URL')
  .action(actions.onCurrent)

program
  .command('use <name>')
  .description('Change current registry')
  .action(actions.onUse)

program
  .command('add <name> <url> [home]')
  .description('Add custom registry')
  .action(actions.onAdd)

program
  .command('del <name>')
  .description('Delete custom registry')
  .action(actions.onDelete)

program
  .command('set-publish <name> <publishRegistry>')
  .description(
    'Set ohrm publish registry for a custom registry to publish package',
  )
  .action(actions.onSetPublish)

program
  .command('set-scope <scopeName> <url>')
  .description('Associating a scope with a registry')
  .action(actions.onSetScope)

program
  .command('del-scope <scopeName>')
  .description('Remove a scope')
  .action(actions.onDeleteScope)

program.parse(process.argv)

if (process.argv.length === 2) {
  program.outputHelp()
}
