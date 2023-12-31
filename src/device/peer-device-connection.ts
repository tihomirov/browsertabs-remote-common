import type {DataConnection, Peer, PeerErrorType} from 'peerjs';
import {BehaviorSubject, fromEventPattern, Observable, of, Subject} from 'rxjs';
import {filter, map,takeUntil} from 'rxjs/operators';

import {
  Action,
  ActionType,
  createDataAction,
  createDataMessage,
  dataMessageTypeguard,
  Message,
  MessageType
} from '../common';
import {isSomething} from '../common/utils';
import {TabInfo} from '../types';
import {IDeviceConnection} from './types';

export class PeerDeviceConnection implements IDeviceConnection {
  readonly error$: Observable<{type: PeerErrorType}>;
  readonly close$: Observable<void>;
  private readonly _connection: DataConnection;
  private readonly _unsubscribeSubject$ = new Subject<void>();
  private readonly _tabInfo$ = new BehaviorSubject<TabInfo | undefined>(undefined);

  constructor(
    private readonly _peer: Peer,
    private readonly _peerId: string,
  ) {
    this._connection = this._peer.connect(this._peerId);

    this.error$ = fromEventPattern(
      handler => this._connection.on('error', handler),
      handler => this._connection.off('error', handler),
      (data: {type: PeerErrorType}) => data,
    ).pipe(
      takeUntil(this._unsubscribeSubject$)
    );

    this.close$ = fromEventPattern(
      handler => this._connection.on('close', handler),
      handler => this._connection.off('close', handler),
      () => undefined,
    ).pipe(
      takeUntil(this._unsubscribeSubject$)
    );

    fromEventPattern(
      handler => this._connection.on('open', handler),
      handler => this._connection.off('open', handler),
      () => undefined,
    ).pipe(
      takeUntil(this._unsubscribeSubject$),
    ).subscribe(this.onOpen);

    fromEventPattern(
      handler => this._connection.on('data', handler),
      handler => this._connection.off('data', handler),
    ).pipe(
      takeUntil(this._unsubscribeSubject$),
      filter(dataMessageTypeguard),
      map(data => data.message),
    ).subscribe(this.onMessage);
  }

  get tabInfo$(): Observable<TabInfo> {
    return this._tabInfo$.pipe(
      filter(isSomething)
    );
  }

  get peerId(): string {
    return this._peerId;
  }

  get actions$(): Observable<ReadonlyArray<ActionType>> {
    return of([
      ActionType.Reload,
      ActionType.Close,
      ActionType.ToggleMute,
      ActionType.IncreaseZoom,
      ActionType.DecreaseZoom,
      ActionType.SetZoom,
      ActionType.Create
    ]);
  }

  sendAction(action: Action): void {
    this._connection.send(createDataAction(action));
  }

  dispose(): void {
    this._connection.close();
    this._unsubscribeSubject$.next();
    this._unsubscribeSubject$.complete();
  }

  private readonly sendMessage = (message: Message): void => {
    this._connection.send(createDataMessage(message));
  };

  private readonly onOpen = (): void  => {
    this.sendMessage({
      type: MessageType.TabInfoRequest,
    });
  };

  private readonly onMessage = (message: Message): void  => {
    if (message.type === MessageType.TabInfoResponse) {
      this._tabInfo$.next(message.tabInfo);
    }
  };
}