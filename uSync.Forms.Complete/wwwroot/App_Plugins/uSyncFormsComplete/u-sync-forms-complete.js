//#region src/menus/manifest.ts
var e = [
	"forms-form-root",
	"forms-folder",
	"forms-form",
	"forms-prevalue-root",
	"forms-prevalue",
	"forms-datasource-root",
	"forms-datasource"
], t = [{
	type: "entityAction",
	kind: "publisher-push",
	alias: "usync.forms.push.action",
	name: "Push Form",
	forEntityTypes: e
}, {
	type: "entityAction",
	kind: "publisher-pull",
	alias: "usync.forms.pull.action",
	name: "Pull Form",
	forEntityTypes: e
}];
//#endregion
export { t as manifests };

//# sourceMappingURL=u-sync-forms-complete.js.map