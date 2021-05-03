/* eslint-disable no-unused-vars */
declare module 'vigemclient' {
  export interface InputAxis {
    maxValue: number,
    minValue: number,
    name: string,
    value: number,

    setValue(value: number): void;
  }

  export interface InputButton {
    name: string,
    value: number,

    setValue(value: boolean): void;
  }

  export type AxisMap = {
    dpadHorz: InputAxis;
    dpadVert: InputAxis;

    leftX: InputAxis;
    leftY: InputAxis;

    rightX: InputAxis;
    rightY: InputAxis;

    leftTrigger: InputAxis;
    rightTrigger: InputAxis;
  }

  export type ConnectOptions = {
    productID: string,
    vendorID: string,
  }

  export type X360ControllerButtonMap = {
    START: InputButton;
    BACK: InputButton;

    LEFT_THUMB: InputButton;
    RIGHT_THUMB: InputButton;
    GUIDE: InputButton;

    LEFT_SHOULDER: InputButton;
    RIGHT_SHOULDER: InputButton;

    A: InputButton;
    B: InputButton;
    X: InputButton;
    Y: InputButton;
  }

  export interface ViGEmTarget {
    axis: AxisMap,
    index: number;
    productId: string;
    type: string;
    updateMode: string;
    vendorID: string;

    connect(): null | Error;
    connect(options: ConnectOptions): null | Error;
    disconnect(): null | Error;
    resetInputs(): void;
    update(): void;
  }

  export interface X360Controller extends ViGEmTarget {
    button: X360ControllerButtonMap;
  }

  export default class ViGEmClient {
    connect(): null | Error;
    createX360Controller(): X360Controller;
  }
}
