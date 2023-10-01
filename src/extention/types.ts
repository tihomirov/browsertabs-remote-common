import type {Observable} from 'rxjs';
import {DataConnection} from 'peerjs';
import {PeerErrorType} from 'peerjs';

import {Action} from '../common';

export interface IExtentionConnection {
  readonly open$: Observable<string>;
  readonly connected$: Observable<DataConnection>;
  readonly action$: Observable<Action>;
  readonly error$: Observable<{type: PeerErrorType}>;
  readonly close$: Observable<void>;
  readonly peerId: string;
  destroy(): void;
}
