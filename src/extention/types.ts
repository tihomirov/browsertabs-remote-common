import {DataConnection} from 'peerjs';
import {PeerErrorType} from 'peerjs';
import type {Observable} from 'rxjs';

import {Action} from '../common';

export interface IExtentionConnection {
  readonly open$: Observable<string>;
  readonly connected$: Observable<DataConnection>;
  readonly disconnected$: Observable<void>;
  readonly action$: Observable<Action>;
  readonly error$: Observable<{type: PeerErrorType}>;
  readonly close$: Observable<void>;
  readonly peerId: string;
  destroy(): void;
}
