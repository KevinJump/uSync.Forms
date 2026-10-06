# Changelog

All notable changes to uSync.Forms are documented here.

## Unreleased

### Fixed

- Form picker dependencies were dropped when the picked form had a data source.
- Moving a form between folders (or back to the root) now syncs for existing forms.
- Nested form folders are imported parent-first, so a child folder no longer fails or
  creates a duplicate parent.
- `GoToPageOnSubmit` is imported as the value in the file, so forms without a redirect
  no longer show as changed on every import.
- Content id mapping in prevalue source settings: values with more than one id, or the
  same id twice, now map correctly, and digits inside GUIDs are no longer treated as ids.
- Pushing or pulling a forms folder now includes forms in every folder beneath it, not
  only its direct child folders.

### Changed

- Forms are saved once per import instead of twice.
- Item existence checks use the Forms `Exists` APIs instead of loading every item.
- Removed `CleanseNode` overrides that re-parsed the XML on every comparison without
  changing it.
- Prevalue sources are looked up once per form import instead of once per field.
- Removed unused code: reflection for `FolderId` on export, and the unused
  `IEntityService` constructor argument on `FormSerializer`.
