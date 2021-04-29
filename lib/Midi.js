const midi = require('midi');

module.exports = class Midi {
  constructor({ onMessage = null } = {}) {
    this._input = new midi.Input();

    if (onMessage) {
      this._input.on('message', (deltaTime, message) => onMessage(message));
    }
  }

  close(port) {
    this._input.closePort(port);
  }

  getDevices() {
    const portCount = this._input.getPortCount();

    return Array.from({ length: portCount }, (_, index) => ({
      name: this._input.getPortName(index),
      port: index,
    }));
  }

  dispose() {
    this._input.closePort();
  }

  open(port) {
    this._input.openPort(port);
  }

  static createFromPort(port, options) {
    const midi = new Midi(options);

    midi.open(port);

    return midi;
  }

  static createFromDeviceName(deviceName, options) {
    const devices = Midi.getDevices();
    const device = devices.find(d => d.name === deviceName);

    if (device) {
      return Midi.createFromPort(device.port, options);
    } else {
      throw new Error(`Device "${deviceName}" is not found`);
    }
  }

  static createPerDevice({ onMessage } = {}) {
    const devices = Midi.getDevices();

    return devices.map((device) => {
      const midi = new Midi({
        onMessage: (message) => onMessage(device, message),
      });

      midi.open(device.port);

      return {
        device,
        midi,
      };
    });
  }

  static getDevices() {
    const midi = new Midi();
    const devices = midi.getDevices();

    midi.dispose();

    return devices;
  }
}
