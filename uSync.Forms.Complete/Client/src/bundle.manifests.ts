import { manifests as actions } from "./menus/manifest.js";

// Job of the bundle is to collate all the manifests from different parts of the extension and load other manifests
// We load this bundle from the manifest in uSyncFormsCompleteManifestReader.cs
export const manifests: Array<UmbExtensionManifest> = [...actions];
