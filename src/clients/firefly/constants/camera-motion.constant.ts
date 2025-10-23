export const CameraMotion = {
  PAN_LEFT: 'camera pan left',
  PAN_RIGHT: 'camera pan right',
  ZOOM_IN: 'camera zoom in',
  ZOOM_OUT: 'camera zoom out',
  TILT_UP: 'camera tilt up',
  TILT_DOWN: 'camera tilt down',
  LOCKED_DOWN: 'camera locked down',
  HANDHELD: 'camera handheld',
} as const;

export type CameraMotion = (typeof CameraMotion)[keyof typeof CameraMotion];
