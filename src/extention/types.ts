import type {Observable} from 'rxjs';
import {Action} from '../common';

export interface IExtentionConnection {
  open(): Promise<string>;
  action$(): Observable<Action>;
  close(): void;
}
