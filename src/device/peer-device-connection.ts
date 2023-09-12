import type {Peer, DataConnection, PeerErrorType} from 'peerjs';
import {BehaviorSubject, fromEventPattern, Observable, Subject} from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';

import {TabInfo} from '../types';
import {Action, Message, MessageType, messageTypeguard} from '../common';
import {IDeviceConnection} from './types';

export class PeerDeviceConnection implements IDeviceConnection {
  readonly error$: Observable<{type: PeerErrorType}>;
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
      filter(messageTypeguard)
    ).subscribe(this.onMessage);
  }

  get tabInfo$(): Observable<TabInfo | undefined> {
    return this._tabInfo$;
  }

  sendAction(action: Action): void {
    this._connection.send(action);
  }

  dispose(): void {
    this._connection.close();
    this._unsubscribeSubject$.next();
    this._unsubscribeSubject$.complete();
  }

  private readonly sendMessage = (message: Message): void => {
    this._connection.send(message);
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