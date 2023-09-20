import type {Observable} from 'rxjs';
import type {PeerErrorType} from 'peerjs';

import {Action, ActionType} from '../common';
import {TabInfo} from '../types';

export interface IDeviceConnection {
  readonly tabInfo$: Observable<TabInfo>;
  readonly error$: Observable<{type: PeerErrorType}>;
  readonly actions$: Observable<ReadonlyArray<ActionType>>;
  readonly close$: Observable<void>;
  readonly peerId: string;
  sendAction(action: Action): void;
  dispose(): void;
}
