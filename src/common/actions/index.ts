export const enum ActionType {
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
