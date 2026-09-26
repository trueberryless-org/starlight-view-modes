declare module "virtual:starlight-view-modes/config" {
  const StarlightViewModesConfig: import("./libs/config").StarlightViewModesConfig;

  export default StarlightViewModesConfig;
}

declare module "virtual:starlight-view-modes/context" {
  const StarlightViewModesContext: import("./libs/vite").StarlightViewModesContext;

  export default StarlightViewModesContext;
}
