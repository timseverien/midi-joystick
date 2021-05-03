import { ConnectOptions, InputAxis, X360Controller } from 'vigemclient';

export enum VirtualControllerAxis {
  dpadX = 'dpadHorz',
  dpadY = 'dpadVert',
  stickLeftX = 'leftX',
  stickLeftY = 'leftY',
  stickRightX = 'rightX',
  stickRightY = 'rightY',
  triggerLeft = 'leftTrigger',
  triggerRight = 'rightTrigger',
}

export enum VirtualControllerButton {
  a = 'A',
  b = 'B',
  back = 'BACK',
  guide = 'GUIDE',
  shoulderLft = 'LEFT_SHOULDER',
  shoulderRight = 'RIGHT_SHOULDER',
  thumbLeft = 'LEFT_THUMB',
  thumbRight = 'RIGHT_THUMB',
  x = 'X',
  y = 'Y',
}

function mix(a: number, b: number, t: number): number {
  return a + t * (b - a);
}

export default class VirtualController {
  public id: string;

  private virtualController: X360Controller;

  constructor(id: string, virtualController: X360Controller) {
    this.id = id;
    this.virtualController = virtualController;
  }

  connect(options: ConnectOptions = null): void {
    const result = options
      ? this.virtualController.connect(options)
      : this.virtualController.connect();

    if (result) {
      throw result;
    }
  }

  disconnect(): void {
    const result = this.virtualController.disconnect();

    if (result) {
      throw result;
    }
  }

  setAxisValue(key: string, value: number): void {
    const axisName = VirtualControllerAxis[key];
    const axis = this.virtualController.axis[axisName] as InputAxis;

    this.virtualController.axis[axisName].setValue(mix(axis.minValue, axis.maxValue, value));
  }

  setButtonValue(key: string, value: boolean): void {
    const buttonName = VirtualControllerButton[key];

    this.virtualController.button[buttonName].setValue(value);
  }
}
