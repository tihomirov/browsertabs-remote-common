import type {Observable} from 'rxjs';
import type {PeerErrorType} from 'peerjs';

import {Action} from '../common';
import {TabInfo} from '../types';

export interface IDeviceConnection {
  readonly tabInfo$: Observable<TabInfo | undefined>;
  readonly error$: Observable<{type: PeerErrorType}>;
  sendAction(action: Action): void;
  dispose(): void;
}
