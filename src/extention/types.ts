import type {Observable} from 'rxjs';
import {DataConnection} from 'peerjs';
import {PeerErrorType} from 'peerjs';

import {Action} from '../common';
import {typeguard, isEnum} from '../common/utils';

export interface IExtentionConnection {
  open$: Observable<string>;
  connected$: Observable<DataConnection>;
  action$: Observable<Action>;
  error$: Observable<string>;
  close$: Observable<void>;
  peerId: string;
  destroy(): void;
}

export const peerErrorTypeTypeguard = typeguard<{type: PeerErrorType}>(
  ['type', isEnum(PeerErrorType)],
);
