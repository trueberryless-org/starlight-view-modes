import type { ViteUserConfig } from 'astro';
import { resolve } from 'path';
import type { StarlightViewModesConfig } from '..';

export function vitePluginStarlightViewModesConfig(
  config: StarlightViewModesConfig
): VitePlugin {
  const moduleId = 'virtual:starlight-view-modes-config';
  const resolvedModuleId = `\0${moduleId}`;
  const moduleContent = `export default ${JSON.stringify(config)}`;

  // Path to the utils directory within @astrojs/starlight
  const utilsPath = resolve(
    process.cwd(),
    'node_modules/@astrojs/starlight/utils'
  );

  return {
    name: 'vite-plugin-starlight-view-modes-config',

    load(id) {
      if (id === resolvedModuleId) {
        return moduleContent;
      }

      // Handle the utils path for the virtual import
      if (id === 'virtual:starlight/utils') {
        return `export * from '${utilsPath}';`;
      }

      return undefined;
    },

    resolveId(id) {
      if (id === moduleId) {
        return resolvedModuleId;
      }

      // Resolve the virtual import for utils/navigation
      if (id === 'virtual:starlight/utils') {
        return id;
      }

      return undefined;
    },
  };
}

type VitePlugin = NonNullable<ViteUserConfig['plugins']>[number];
