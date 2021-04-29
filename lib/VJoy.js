const { vJoy, vJoyDevice } = require('vjoy');

module.exports = class VJoyHelper {
  static getDevice(deviceId) {
    if (!vJoyDevice.exists(deviceId)) {
      throw new Error(`VJoy device "${deviceId}" does not exist`);
    }

    const deviceStatus = vJoyDevice.status(deviceId);

    if (deviceStatus !== 'free') {
      throw new Error(`VJoy device "${deviceId}" is not free but has status "${deviceStatus}"`);
    }

    const device = new vJoyDevice(deviceId);

    device.initialize();
    device.updateInputs();

    return device;
  }

  static getDeviceIds() {
    const devices = [];
    const deviceCount = vJoy.maxDevices();

    for (let id = 0; id < deviceCount; id++) {
      if (vJoyDevice.exists(id)) {
        devices.push(id);
      }
    }

    return devices;
  }

  static getDeviceAxes() {
    return vJoy.axes;
  }
}
