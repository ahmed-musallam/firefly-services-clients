export const PromptStyle = {
  ANIME: "anime",
  THREE_D: "3d",
  FANTASY: "fantasy",
  CINEMATIC: "cinematic",
  CLAYMATION: "claymation",
  LINE_ART: "line art",
  STOP_MOTION: "stop motion",
  TWO_D: "2d",
  VECTOR_ART: "vector art",
  BLACK_AND_WHITE: "black and white",
} as const;

export type PromptStyle = (typeof PromptStyle)[keyof typeof PromptStyle];
