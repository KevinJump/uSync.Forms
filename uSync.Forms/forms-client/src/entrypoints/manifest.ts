export const manifests: Array<UmbExtensionManifest> = [
  {
    type: "backofficeEntryPoint",
    name: "uSync.Forms Entrypoint",
    alias: "uSync.Forms.Entrypoint",
    js: () => import("./entrypoint.js"),
  },
];
