import config from "virtual:starlight-view-modes-config";

export const modes: Mode[] = [
  {
    name: "Zen Mode",
    slug: "zen-mode",
    enabled: config.zenModeSettings.enabled,
    icon: "sun",
  },
];

export type Mode = {
  name: string;
  slug: string;
  enabled: boolean;
  icon: string;
};
