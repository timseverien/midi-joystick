export enum MidiMessageType {
  channelAftertouch = 'channelAftertouch',
  controlChange = 'controlChange',
  noteOff = 'noteOff',
  noteOn = 'noteOn',
  pitchWheel = 'pitchWheel',
  polyphonicAftertouch = 'polyphonicAftertouch',
  programChange = 'programChange',
  unknown = 'unknown',
}

export enum MidiMessageControlType {
  button = 'button',
  range = 'range',
}

export default class MidiMessage {
  public data0: number;
  public data0AsString: string;
  public data1: number;
  public data1AsString: string;
  public status: number;
  public statusAsString: string;

  public channel: string;
  public controlType: MidiMessageControlType;
  public key: string;
  public type: MidiMessageType;

  public get value(): number {
    switch (this.type) {
      // Integer values
      case MidiMessageType.channelAftertouch:
      case MidiMessageType.programChange:
        return this.data0;

      // Special
      case MidiMessageType.pitchWheel:
        return this.data0;

      default:
        return this.data1;
    }
  }

  public get valueBoolean(): boolean {
    return this.value >= 63;
  }

  constructor(status: number, data0: number, data1: number) {
    this.data0 = data0;
    this.data0AsString = data0.toString(16).padStart(2, '0');
    this.data1 = data1;
    this.data1AsString = data1.toString(16).padStart(2, '0');
    this.status = status;
    this.statusAsString = status.toString(16).padStart(2, '0');

    this.channel = this.statusAsString.substring(1);
    this.controlType = this.getControlType();
    this.key = `${this.statusAsString}${this.data0AsString}`;
    this.type = this.getType();
  }

  private getControlType(): MidiMessageControlType {
    const type = this.getType();

    switch (type) {
      case MidiMessageType.controlChange:
      case MidiMessageType.pitchWheel:
        return MidiMessageControlType.range;
      default:
        return MidiMessageControlType.button;
    }
  }

  private getType(): MidiMessageType {
    switch (this.statusAsString.charAt(0)) {
      case '8':
        return MidiMessageType.noteOff;
      case '9':
        return MidiMessageType.noteOn;
      case 'a':
        return MidiMessageType.polyphonicAftertouch;
      case 'b':
        return MidiMessageType.controlChange;
      case 'c':
        return MidiMessageType.programChange;
      case 'd':
        return MidiMessageType.channelAftertouch;
      case 'e':
        return MidiMessageType.pitchWheel;
      default:
        return MidiMessageType.unknown;
    }
  }
}
