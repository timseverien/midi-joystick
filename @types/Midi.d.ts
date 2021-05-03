/* eslint-disable import/prefer-default-export, no-unused-vars */
declare module 'midi' {
  export class Input {
    constructor();

    closePort(): void;

    closePort(port: number): void;

    getPortCount(): number;

    getPortName(port: number): string;

    ignoreTypes(sysex: boolean, timing: boolean, activeSensing: boolean): void;

    on(event: string, callback: Function): void;

    openPort(port: number): void;
  }
}
