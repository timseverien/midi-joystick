module.exports = class MidiVjoyMapping {
  constructor(mapping = {}) {
    this._mapping = mapping;
  }

  add(midiDeviceName, midiKnobKey, vJoyDeviceId, vJoyAxis) {
    if (!(midiDeviceName in this._mapping)) {
      this._mapping[midiDeviceName] = {};
    }

    this._mapping[midiDeviceName][midiKnobKey] = {
      axis: vJoyAxis,
      device: vJoyDeviceId,
    };
  }

  get(midiDeviceName, midiKnobKey) {
    if (!(midiDeviceName in this._mapping)) {
      return null;
    }

    if (!(midiKnobKey in this._mapping[midiDeviceName])) {
      return null;
    }

    return this._mapping[midiDeviceName][midiKnobKey];
  }

  getRegisteredMidiDeviceNames() {
    return Object.keys(this._mapping);
  }

  getRegisteredVjoyAxes(vJoyDeviceId) {
    const axes = new Set();

    for (const midiDevice of Object.values(this._mapping)) {
      for (const vJoyMappingObject of Object.values(midiDevice)) {
        if (vJoyMappingObject.device === vJoyDeviceId) {
          axes.add(vJoyMappingObject.axis);
        }
      }
    }

    return Array.from(axes);
  }

  getRegisteredVjoyDevices() {
    const devices = new Set();

    for (const midiDevice of Object.values(this._mapping)) {
      for (const vJoyMappingObject of Object.values(midiDevice)) {
        devices.add(vJoyMappingObject.device);
      }
    }

    return Array.from(devices);
  }

  toString() {
    return JSON.stringify(this._mapping);
  }

  static fromString(mapping) {
    return new MidiVjoyMapping(JSON.parse(mapping));
  }

  static getMidiKnobKeyFromMessage(message) {
    return `${message[0]}|${message[1]}`;
  }
}
