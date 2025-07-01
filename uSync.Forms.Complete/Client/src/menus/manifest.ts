const formEntityTypes = [
  "forms-form-root",
  "forms-folder",
  "forms-form",
  "forms-prevalue-root",
  "forms-prevalue",
  "forms-datasource-root",
  "forms-datasource",
];

const actions: Array<UmbExtensionManifest> = [
  {
    type: "entityAction",
    kind: "publisher-push",
    alias: "usync.forms.push.action",
    name: "Push Form",
    forEntityTypes: formEntityTypes,
  },
  {
    type: "entityAction",
    kind: "publisher-pull",
    alias: "usync.forms.pull.action",
    name: "Pull Form",
    forEntityTypes: formEntityTypes,
  },
];

export const manifests: Array<UmbExtensionManifest> = [...actions];
