const fs = require('fs-extra');
const path = require('path');

const Midi = require('../Midi');
const MidiVjoyMapping = require('../MidiVjoyMapping');
const VJoy = require('../VJoy');

function mix(a, b, t) {
  return a + t * (b - a);
}

module.exports = async (options = {}) => {
  const config = await fs.readJson(path.resolve(options.config))
  const mapping = new MidiVjoyMapping(config);

  const vJoyDeviceMapping = Object.fromEntries(mapping.getRegisteredVjoyDevices().map((deviceId) => [
    deviceId,
    VJoy.getDevice(deviceId)
  ]));

  const midi = mapping.getRegisteredMidiDeviceNames()
    .map((deviceName) => Midi.createFromDeviceName(deviceName, {
      onMessage(message) {
        const knobKey = MidiVjoyMapping.getMidiKnobKeyFromMessage(message);
        const vJoyObject = mapping.get(deviceName, knobKey);

        if (!vJoyObject) {
          return;
        }

        const valueNormalized = message[2] / 127;
        const vJoyValue = Math.floor(mix(1, 32768, valueNormalized));

        console.log(`${vJoyObject.device} ${vJoyObject.axis}: ${vJoyValue}`);
        vJoyDeviceMapping[vJoyObject.device].axes[vJoyObject.axis].set(vJoyValue);
      }
    }));

  process.on('SIGTERM', () => {
    midi.dispose();

    for (const device of vJoyDeviceMapping) {
      device.free();
    }
  });
}
