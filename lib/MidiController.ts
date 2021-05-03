import { Input as MidiInput } from 'midi';

import EventHandler from './EventHandler';
import MidiMessage from './MidiMessage';

export type IMidiDevice = {
  name: string;
  port: number;
}

type EventHandlerFunction = (event: MidiMessage) => void;

export default class MidiController extends EventHandler {
  public name: string;

  private midiInput: MidiInput;
  private port: number;

  constructor(port: number) {
    super();

    this.midiInput = new MidiInput();
    this.port = port;

    this.name = MidiController.getNormalizedName(this.midiInput.getPortName(port));
  }

  public connect() {
    this.midiInput.on('message', (deltaTime, message) => this.emit('message', new MidiMessage(message[0], message[1], message[2])));
    this.midiInput.openPort(this.port);
  }

  public disconnect() {
    this.midiInput.closePort();
  }

  public on(eventName: string, hander: EventHandlerFunction): void {
    super.on(eventName, hander);
  }

  public static getDevices(): IMidiDevice[] {
    const input = new MidiInput();
    const devices = [];

    for (let i = 0; i < input.getPortCount(); i++) {
      devices.push({
        name: MidiController.getNormalizedName(input.getPortName(i)),
        port: i,
      });
    }

    return devices;
  }

  private static getNormalizedName(name: string): string {
    return name.replace(/\s+\d+$/, '');
  }
}
