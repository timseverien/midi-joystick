const fs = require('fs-extra');
const inquirer = require('inquirer');
const path = require('path');

const VJoy = require('../VJoy');
const Midi = require('../Midi');
const MidiVjoyMapping = require('../MidiVjoyMapping');

function getAvailableVJoyAxes(mapping, vJoyDeviceId) {
  const assignedAxes = mapping.getRegisteredVjoyAxes(vJoyDeviceId);

  return VJoy.getDeviceAxes()
    .filter((axis) => !assignedAxes.includes(axis));
}

function discoverMidiKnob(port) {
  return new Promise((resolve, reject) => {
    const midi = Midi.createFromPort(port, {
      onMessage([status, data1, data2]) {
        midi.dispose();
        resolve([status, data1]);
      },
    });
  });
}

module.exports = async (options = {}) => {
  const mapping = new MidiVjoyMapping();
  let isConfiguring = true;

  while (isConfiguring) {
    const midiDevices = Midi.getDevices();

    if (midiDevices.length === 0) {
      console.warn('No MIDI devices available');

      isConfiguring = false;
      continue;
    }

    const vJoyDeviceIds = VJoy.getDeviceIds()
      .filter((vJoyDeviceId) => getAvailableVJoyAxes(mapping, vJoyDeviceId).length > 0);

    if (vJoyDeviceIds.length === 0) {
      console.warn('No unmapped vJoy devices available');

      isConfiguring = false;
      continue;
    }

    const deviceConfiguration = await inquirer.prompt([
      {
        choices: midiDevices.map((device) => ({
          name: device.name,
          value: device.port,
        })),
        loop: false,
        message: 'MIDI device',
        name: 'midiDevice',
        type: 'list',
      },
      {
        choices: vJoyDeviceIds,
        loop: false,
        message: 'vJoy device ID',
        name: 'vJoyDevice',
        type: 'list',
      },
      {
        choices: (answers) => getAvailableVJoyAxes(mapping, answers.vJoyDevice),
        loop: false,
        message: 'Axis',
        name: 'vJoyAxis',
        type: 'list',
      },
    ]);

    console.log('Turn/slide one knob/slider of your MIDI device to assign it');

    const knob = await discoverMidiKnob(deviceConfiguration.midiDevice);
    const midiDeviceName = midiDevices.find(device => device.port === deviceConfiguration.midiDevice).name;

    mapping.add(
      midiDeviceName,
      MidiVjoyMapping.getMidiKnobKeyFromMessage(knob),
      deviceConfiguration.vJoyDevice,
      deviceConfiguration.vJoyAxis
    );

    isConfiguring = (await inquirer.prompt([
      {
        message: 'Add another knob/slider?',
        name: 'continue',
        type: 'confirm',
      },
    ])).continue;
  }

  const output = path.resolve(options.output);

  await fs.ensureDir(path.dirname(output));
  await fs.writeFile(output, mapping.toString());
};
