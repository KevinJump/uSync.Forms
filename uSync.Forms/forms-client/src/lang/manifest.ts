const localizations: UmbExtensionManifest = {
  type: "localization",
  alias: "uSync.Forms.localization.en",
  name: "uSync Forms English Localization",
  weight: 100,
  meta: {
    culture: "en",
  },
  js: () => import("./en.js"),
};

export const manifests: Array<UmbExtensionManifest> = [localizations];
