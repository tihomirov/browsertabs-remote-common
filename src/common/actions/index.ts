import {isEnum,typeguard} from '../utils';

export enum ActionType {
  Reload,
  Close,
  ToggleMute,
  IncreaseZoom,
  DecreaseZoom,
  SetZoom,
  Create,
}

export type ReloadAction = Readonly<{
  type: ActionType.Reload;
}>;

export type CloseAction = Readonly<{
  type: ActionType.Close;
}>;

export type ToggleMuteAction = Readonly<{
  type: ActionType.ToggleMute;
}>;

export type IncreaseZoomAction = Readonly<{
  type: ActionType.IncreaseZoom;
}>;

export type DecreaseZoomAction = Readonly<{
  type: ActionType.DecreaseZoom;
}>;

export type SetZoomAction = Readonly<{
  type: ActionType.SetZoom;
  zoomFactor: number;
}>;

export type CreateAction = Readonly<{
  type: ActionType.Create;
  url: string;
}>;

export type Action = ReloadAction | CloseAction | ToggleMuteAction | IncreaseZoomAction | DecreaseZoomAction | SetZoomAction | CreateAction;

const actionTypeguard = typeguard<Action>(
  ['type', isEnum(ActionType)],
);

type DataAction = Readonly<{
  type: 'action';
  action: Action;
}>;

export const dataActionTypeguard = typeguard<DataAction>(
  ['type', v => v === 'action'],
  ['action', actionTypeguard],
);

export const createDataAction = (action: Action): DataAction => ({
  type: 'action',
  action
});
