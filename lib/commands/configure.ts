import fs from 'fs-extra';
import inquirer from 'inquirer';
import path from 'path';

import { VirtualControllerAxis, VirtualControllerButton } from '../VirtualController';
import MidiController from '../MidiController';
import MidiMessage, { MidiMessageControlType } from '../MidiMessage';
import VirtualControllerMidiMapping from '../MidiVirtualControllerMapping';

function waitForMidiMessage(
  midiController: MidiController,
  midiMessageControlType: MidiMessageControlType
): Promise<MidiMessage> {
  return new Promise((resolve, reject) => {
    midiController.connect();
    midiController.on('message', (message) => {
      if (message.controlType === midiMessageControlType) {
        resolve(message);
        midiController.disconnect();
      }
    });
  });
}

export default async function configure(options: { output: string }) {
  const midiControllers = MidiController.getDevices();
  const midiVirtualControllerMapping = new VirtualControllerMidiMapping();

  await fs.ensureDir(path.dirname(options.output));

  for (let virtualControllerId = 0; virtualControllerId < 1024; virtualControllerId++) {
    const { midiDevice } = await inquirer.prompt([
      {
        message: 'MIDI device',
        name: 'midiDevice',
        type: 'list',
        choices: midiControllers.map((midiController) => ({
          name: midiController.name,
          value: midiController,
        })),
      },
    ]);

    while (true) {
      const { axisOrButton } = await inquirer.prompt([
        {
          loop: false,
          message: 'Virtual controller axis or button',
          name: 'axisOrButton',
          type: 'list',

          choices: [
            {
              name: 'Done',
              value: null,
            },

            new inquirer.Separator('---- Axes ----'),

            ...Object.keys(VirtualControllerAxis).map(key => ({
              name: `${key} ${midiVirtualControllerMapping.isVirtualControllerKeySet(virtualControllerId.toString(), key) ? '(is set)' : ''}`,
              value: { key, type: 'axis' },
            })),

            new inquirer.Separator('---- Buttons ----'),

            ...Object.keys(VirtualControllerButton).map(key => ({
              name: `${key} ${midiVirtualControllerMapping.isVirtualControllerKeySet(virtualControllerId.toString(), key) ? '(is set)' : ''}`,
              value: { key, type: 'button' },
            })),
          ],
        },
      ]);

      if (axisOrButton === null) {
        break;
      }

      const isKeyAxis = Object.keys(VirtualControllerAxis).includes(axisOrButton.key);
      const midiMessageControlType = isKeyAxis ? MidiMessageControlType.range : MidiMessageControlType.button;
      const midiMessageControlTypeTerm = midiMessageControlType === MidiMessageControlType.button ? 'button' : 'knob or slider';

      console.log(`Use a ${midiMessageControlTypeTerm} on device "${midiDevice.name}"`);

      const midiController = new MidiController(midiDevice.port);
      const midiMessage = await waitForMidiMessage(midiController, midiMessageControlType);

      midiVirtualControllerMapping.set(
        midiController,
        midiMessage,
        virtualControllerId.toString(),
        axisOrButton.key
      );

      await fs.writeFile(options.output, midiVirtualControllerMapping.toString());
    }

    const { next } = await inquirer.prompt([
      {
        default: false,
        message: 'Would you like to add another virtual controller?',
        name: 'next',
        type: 'confirm',
      },
    ]);

    if (!next) break;
  }
};
