import {typeguard, isEnum} from '../utils';
import {TabInfo} from '../../types';

export enum MessageType {
  TabInfoRequest,
  TabInfoResponse,
}

export type TabInfoRequestMessage = Readonly<{
  type: MessageType.TabInfoRequest;
}>;

export type TabInfoResponseMessage = Readonly<{
  type: MessageType.TabInfoResponse;
  tabInfo: TabInfo;
}>;

export type Message = TabInfoRequestMessage | TabInfoResponseMessage;

export const messageTypeguard = typeguard<Message>(
  ['type', isEnum(MessageType)],
);
