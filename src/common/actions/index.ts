export const enum ActionType {
  Reload = 'Reload',
  Close = 'Close',
  ToggleMute = 'Toggle Mute',
  IncreaseZoom = 'Increase Zoom',
  DecreaseZoom = 'Decrease Zoom',
  SetZoom = 'Set Zoom',
  Create = 'Create',
}

export type ReloadAction = Readonly<{
  type: ActionType.Reload;
}>;

export type IncreaseZoomAction = Readonly<{
  type: ActionType.IncreaseZoom;
}>;

export type Action = ReloadAction | IncreaseZoomAction;
