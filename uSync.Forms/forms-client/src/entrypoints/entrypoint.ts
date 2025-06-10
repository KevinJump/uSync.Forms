import type {
  UmbEntryPointOnInit,
  UmbEntryPointOnUnload,
} from "@umbraco-cms/backoffice/extension-api";

// load up the manifests here
export const onInit: UmbEntryPointOnInit = (_host, _extensionRegistry) => {
  // entry point. nothign to see here.
};

export const onUnload: UmbEntryPointOnUnload = (_host, _extensionRegistry) => {
  // leaving.
};
