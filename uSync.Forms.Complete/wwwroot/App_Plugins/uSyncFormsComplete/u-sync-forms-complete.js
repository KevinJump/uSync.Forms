const o = [
  "forms-form-root",
  "forms-folder",
  "forms-form",
  "forms-prevalue-root",
  "forms-prevalue",
  "forms-datasource-root",
  "forms-datasource"
], s = [
  {
    type: "entityAction",
    kind: "publisher-push",
    alias: "usync.forms.push.action",
    name: "Push Form",
    forEntityTypes: o
  },
  {
    type: "entityAction",
    kind: "publisher-pull",
    alias: "usync.forms.pull.action",
    name: "Pull Form",
    forEntityTypes: o
  }
], t = [...s], r = [...t];
export {
  r as manifests
};
//# sourceMappingURL=u-sync-forms-complete.js.map
