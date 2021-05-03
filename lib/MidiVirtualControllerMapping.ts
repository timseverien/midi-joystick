import { VirtualControllerAxis, VirtualControllerButton } from './VirtualController';
import MidiMessage from './MidiMessage';
import MidiController from './MidiController';

type Binding = {
  device: string,
  key: string,
};

type Mapping = {
  [key: string]: {
    [key: string]: Binding,
  }
};

export default class MidiVirtualControllerMapping {
  private mapping: Mapping;

  constructor(mapping = {}) {
    this.mapping = mapping;
  }

  public get(midiControllerName: string, message: MidiMessage) {
    return this.mapping[midiControllerName][message.key] ?? null;
  }

  public getVirtualControllerIds(): string[] {
    const virtualControllers = new Set<string>();

    for (const midiMessageControllerMapping of Object.values(this.mapping)) {
      for (const binding of Object.values(midiMessageControllerMapping)) {
        virtualControllers.add(binding.device);
      }
    }

    return Array.from(virtualControllers);
  }

  public getMidiControllerNames(): string[] {
    return Object.keys(this.mapping);
  }

  public isVirtualControllerKeySet(virtualControllerId, virtualControllerKey) {
    for (const midiMessageControllerMapping of Object.values(this.mapping)) {
      for (const binding of Object.values(midiMessageControllerMapping)) {
        if (binding.device === virtualControllerId && binding.key === virtualControllerKey) {
          return true;
        }
      }
    }

    return false;
  }

  public set(
    midiController: MidiController,
    midiMessage: MidiMessage,
    virtualControllerId: string,
    virtualControllerKey: VirtualControllerAxis | VirtualControllerButton
  ): void {
    if (!this.mapping[midiController.name]) {
      this.mapping[midiController.name] = {};
    }

    this.mapping[midiController.name][midiMessage.key] = {
      device: virtualControllerId,
      key: virtualControllerKey,
    };
  }

  public toString(): string {
    return JSON.stringify(this.mapping);
  }
}
