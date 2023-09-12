import type {Observable} from 'rxjs';
import {DataConnection} from 'peerjs';
import {Action} from '../common';

export interface IExtentionConnection {
  open$: Observable<string>;
  connected$: Observable<DataConnection>;
  action$: Observable<Action>;
  error$: Observable<string>;
  close$: Observable<void>;
  destroy(): void;
}
