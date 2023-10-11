import {DataConnection, Peer, PeerErrorType} from 'peerjs';
import {fromEventPattern,Observable, Subject} from 'rxjs';
import {filter, map, switchMap, takeUntil} from 'rxjs/operators';

import {
  Action,
  createDataMessage,
  dataActionTypeguard,
  dataMessageTypeguard,
  Message,
  MessageType
} from '../common';
import {TabInfo} from '../types';
import {IExtentionConnection} from './types';

export class PeerExtentionConnection implements IExtentionConnection {
  readonly action$: Observable<Action>;
  readonly close$: Observable<void>;
  readonly disconnected$: Observable<void>;
  readonly open$: Observable<string>;
  readonly error$: Observable<{type: PeerErrorType}>;
  private readonly _peer: Peer;
  private readonly _unsubscribeSubject$ = new Subject<void>();
  private readonly _connected$ = new Subject<DataConnection>();
  private _dataConnection: DataConnection | undefined = undefined;

  constructor(private readonly _tabInfo: TabInfo, peerId?: string) {
    this._peer = peerId ? new Peer(peerId) : new Peer();

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
      filter(dataActionTypeguard),
      map(data => data.action),
    );

    this._connected$.pipe(
      switchMap((connection) => fromEventPattern(
        handler => connection.on('data', handler),
        handler => connection.off('data', handler),
      )),
      takeUntil(this._unsubscribeSubject$),
      filter(dataMessageTypeguard),
      map(data => data.message),
    ).subscribe( this.onConnectionMessage);

    this.close$ = this._connected$.pipe(
      switchMap((connection) => fromEventPattern(
        handler => connection.on('close', handler),
        handler => connection.off('close', handler),
      )),
      takeUntil(this._unsubscribeSubject$),
      map(() => undefined),
    );

    this.disconnected$ = fromEventPattern(
      handler => this._peer.on('disconnected', handler),
      handler => this._peer.off('disconnected', handler),
    ).pipe(
      takeUntil(this._unsubscribeSubject$),
      map(() => undefined),
    );

    this.open$ = fromEventPattern<string>(
      handler => this._peer.on('open', handler),
      handler => this._peer.off('open', handler),
    ).pipe(
      takeUntil(this._unsubscribeSubject$),
    );

    this.error$ = fromEventPattern(
      handler => this._peer.on('error', handler),
      handler => this._peer.off('error', handler),
      (data: {type: PeerErrorType}) => data,
    ).pipe(
      takeUntil(this._unsubscribeSubject$),
    );
  }

  get connected$(): Observable<DataConnection> {
    return this._connected$;
  }

  get peerId(): string {
    return this._peer.id;
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
        tabInfo: this._tabInfo,
      });
    }
  };

  private readonly sendMessage = (message: Message): void => {
    this._dataConnection?.send(createDataMessage(message));
  };
}