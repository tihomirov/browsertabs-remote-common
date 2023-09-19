import type {Peer, DataConnection, PeerErrorType} from 'peerjs';
import {BehaviorSubject, fromEventPattern, Observable, of, Subject} from 'rxjs';
import {filter, takeUntil, map} from 'rxjs/operators';

import {TabInfo} from '../types';
import {Action, ActionType, Message, MessageType, createDataAction, createDataMessage, dataMessageTypeguard} from '../common';
import {IDeviceConnection} from './types';
import {isSomething} from '../common/utils';

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

  get actions$(): Observable<ReadonlyArray<Action>> {
    return of([
      {
        type: ActionType.Reload,
      },
      {
        type: ActionType.IncreaseZoom,
      },
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