import {typeguard, isEnum} from '../utils';

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

export type IncreaseZoomAction = Readonly<{
  type: ActionType.IncreaseZoom;
}>;

export type Action = ReloadAction | IncreaseZoomAction;

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
