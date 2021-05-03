import ViGEmClient from 'vigemclient';

import { MidiMessageControlType } from './MidiMessage';
import MidiController from './MidiController';
import MidiVirtualControllerMapping from './MidiVirtualControllerMapping';
import VirtualController from './VirtualController';

export default class MidiVirtualControllerConnector {
  private mapping: MidiVirtualControllerMapping;
  private midiControllers: MidiController[] = [];
  private viGEmClient: ViGEmClient;
  private virtualControllers: VirtualController[] = [];

  constructor(mapping: MidiVirtualControllerMapping) {
    this.mapping = mapping;
    this.viGEmClient = new ViGEmClient();
  }

  public connect(): void {
    this.viGEmClient.connect();

    this.midiControllers = MidiVirtualControllerConnector
      .getMidiControllersByNames(this.mapping.getMidiControllerNames());

    this.virtualControllers = this.mapping.getVirtualControllerIds()
      .map((id) => new VirtualController(id, this.viGEmClient.createX360Controller()));

    for (const midiController of this.midiControllers) {
      midiController.connect();

      midiController.on('message', (message) => {
        const result = this.mapping.get(midiController.name, message);
        const virtualController = this.virtualControllers.find(vc => vc.id === result.device);

        if (message.controlType === MidiMessageControlType.button) {
          virtualController.setButtonValue(result.key, message.valueBoolean);
          console.log(`${midiController.name} ${message.key} => ${result.key} ${message.valueBoolean}`);
        } else {
          const value = message.value / 127;

          virtualController.setAxisValue(result.key, value);

          console.log(`${midiController.name} ${message.key} => ${result.device} ${result.key} ${value}`);
        }
      });
    }

    for (const virtualController of this.virtualControllers) {
      virtualController.connect();
    }
  }

  public disconnect(): void {
    for (const midiController of this.midiControllers) {
      midiController.disconnect();
    }

    for (const virtualController of this.virtualControllers) {
      virtualController.disconnect();
    }
  }

  private static getMidiControllersByNames(midiControllerNames: string[]): MidiController[] {
    const controllers: MidiController[] = [];
    const devices = MidiController.getDevices();

    const midiControllerCountActual = MidiVirtualControllerConnector.createMidiControllerNameCountMapping(devices.map(d => d.name));
    const midiControllerCountExpected = MidiVirtualControllerConnector.createMidiControllerNameCountMapping(midiControllerNames);

    for (const [name, count] of Object.entries(midiControllerCountExpected)) {
      if (midiControllerCountActual[name] !== count) {
        throw new Error([
          'Missing some MIDI devices for this mapping.',
          'Expected:',
          ...Object.entries(midiControllerCountExpected).map(([name, count]) => ` - ${name} (${count}×)`),
          'Found:',
          ...(
            midiControllerCountActual.length
              ? Object.entries(midiControllerCountActual).map(([name, count]) => ` - ${name} (${count}×)`)
              : ['none']
          ),
        ].join('\n'));
      }
    }

    for (const midiControllerName of midiControllerNames) {
      const deviceIndex = devices.findIndex(d => d.name === midiControllerName);

      if (deviceIndex >= 0) {
        controllers.push(...devices.splice(deviceIndex, 1).map(({ port }) => new MidiController(port)));
      } else {
        throw new Error(`Unable to find controller "${midiControllerName}". Are you sure it’s connected.`);
      }
    }

    return controllers;
  }

  private static createMidiControllerNameCountMapping(names: string[]): { [key: string]: number } {
    const mapping = new Map<string, number>();

    for (const name of names) {
      const value = mapping.get(name) ?? 0;

      mapping.set(name, value + 1);
    }

    return Object.fromEntries(mapping.entries());
  }
}
