import { Command } from 'commander';
import configure from './lib/commands/configure';
import run from './lib/commands/run';

const program = new Command();

// TODO: CHANGE TO VIGEM
// https://www.npmjs.com/package/vigemclient

program
  .command('configure')
  .requiredOption('-o, --output <file>', 'Save to configuration file')
  .description('Create a mapping between MIDI device and vJoy device')
  .action(configure);

program
  .command('run')
  .requiredOption('-c, --config <file>', 'Load from configuration file')
  .description('Listen to MIDI messages and pass them to vJoy')
  .action(run);

program.parse(process.argv);
