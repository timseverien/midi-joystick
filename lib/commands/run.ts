import fs from 'fs-extra';

import MidiVirtualControllerConnector from '../MidiVirtualControllerConnector';
import MidiVirtualControllerMapping from '../MidiVirtualControllerMapping';

export default async function run(options: { config: string }) {
  const config = await fs.readJson(options.config);
  const virtualControllerMapping = new MidiVirtualControllerMapping(config);
  const midiVirtualControllerConnector = new MidiVirtualControllerConnector(virtualControllerMapping);

  midiVirtualControllerConnector.connect();

  process.on('SIGTERM', () => {
    midiVirtualControllerConnector.disconnect();
  });
}
