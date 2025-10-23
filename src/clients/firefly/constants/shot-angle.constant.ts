export const ShotAngle = {
  AERIAL: "aerial shot",
  EYE_LEVEL: "eye_level shot",
  HIGH_ANGLE: "high angle shot",
  LOW_ANGLE: "low angle shot",
  TOP_DOWN: "top-down shot",
} as const;

export type ShotAngle = (typeof ShotAngle)[keyof typeof ShotAngle];
