export const AVAILABLE_MODES = ["zen-mode"] as const;
export type AvailableMode = (typeof AVAILABLE_MODES)[number] | "default";
