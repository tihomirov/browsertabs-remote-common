import {Action} from '../common';

export interface IDeviceConnection {
  connect(id: string): void;
  sendAction(action: Action): void;
  dispose(): void;
}
