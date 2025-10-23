export const ShotSize = {
  CLOSE_UP: "close-up shot",
  EXTREME_CLOSE_UP: "extreme close-up",
  MEDIUM: "medium shot",
  LONG: "long shot",
  EXTREME_LONG: "extreme long shot",
} as const;

export type ShotSize = (typeof ShotSize)[keyof typeof ShotSize];
