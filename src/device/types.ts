import type {Observable} from 'rxjs';
import type {PeerErrorType} from 'peerjs';

import {Action} from '../common';
import {TabInfo} from '../types';

export interface IDeviceConnection {
  readonly tabInfo$: Observable<TabInfo>;
  readonly error$: Observable<{type: PeerErrorType}>;
  readonly actions$: Observable<ReadonlyArray<Action>>;
  readonly peerId: string;
  sendAction(action: Action): void;
  dispose(): void;
}
