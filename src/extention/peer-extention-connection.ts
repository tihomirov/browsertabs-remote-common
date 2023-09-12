import {Peer, DataConnection} from 'peerjs';
import {BehaviorSubject, Observable, Subject, fromEventPattern} from 'rxjs';
import {filter, map, switchMap, takeUntil} from 'rxjs/operators';

import {Action, Message, messageTypeguard, actionTypeguard, MessageType} from '../common';
import {IExtentionConnection} from './types';
import {isSomething} from '../common/utils';
import {TabInfo} from '../types';

export class PeerExtentionConnection implements IExtentionConnection {
  readonly action$: Observable<Action>;
  readonly close$: Observable<void>;
  private readonly _peer: Peer;
  private readonly _unsubscribeSubject$ = new Subject<void>();
  private readonly _error$ = new Subject<string>();
  private readonly _connected$ = new Subject<DataConnection>();
  private readonly _open$ = new BehaviorSubject<string | undefined>(undefined);
  private _dataConnection: DataConnection | undefined = undefined;

  constructor(private readonly _tabbInfo: TabInfo) {
    this._peer = new Peer();

    // TODO: refactor to fromEventPattern
    this._peer.once('open', (peerId) => {
      this._open$.next(peerId);
    });

    this._peer.on('error', (error) => {
      this._error$.next(error.message);
    });

    this._peer.on('connection', (connection: DataConnection): void => {
      this._dataConnection = connection;
      this._connected$.next(connection);
    });

    this.action$ = this._connected$.pipe(
      switchMap((connection) => fromEventPattern(
        handler => connection.on('data', handler),
        handler => connection.off('data', handler),
      )),
      takeUntil(this._unsubscribeSubject$),
      filter(actionTypeguard)
    );

    this._connected$.pipe(
      switchMap((connection) => fromEventPattern(
        handler => connection.on('data', handler),
        handler => connection.off('data', handler),
      )),
      takeUntil(this._unsubscribeSubject$),
      filter(messageTypeguard)
    ).subscribe( this.onConnectionMessage);

    this.close$ = this._connected$.pipe(
      switchMap((connection) => fromEventPattern(
        handler => connection.on('close', handler),
        handler => connection.off('close', handler),
      )),
      takeUntil(this._unsubscribeSubject$),
      map(() => undefined),
    );
  }

  get open$(): Observable<string> {
    return this._open$.pipe(
      filter(isSomething)
    );
  }

  get connected$(): Observable<DataConnection> {
    return this._connected$;
  }

  get error$(): Observable<string> {
    return this._error$;
  }

  destroy(): void {
    this._peer?.disconnect();
    this._peer?.destroy();
    this._unsubscribeSubject$.next();
    this._unsubscribeSubject$.complete();
  }

  private readonly onConnectionMessage = (message: Message): void => {
    if (message.type === MessageType.TabInfoRequest) {
      this.sendMessage({
        type: MessageType.TabInfoResponse,
        tabInfo: this._tabbInfo,
      });
    }
  };

  private readonly sendMessage = (message: Message): void => {
    this._dataConnection?.send(message);
  };
}