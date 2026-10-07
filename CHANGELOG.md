# Changelog

All notable changes to uSync.Forms are documented here.

## Unreleased

### Added

- Forms now sync their multi-page paging and summary settings, record retention days,
  entries list display fields, validation rules and block-based submit message. These
  are only imported when they are in the file, so older exports do not reset them.

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
- A folder created from a form's folder path now gets the folder id from the file and
  its real (decoded) name, so the form no longer shows as changed on every import.
- Looking up a form by name no longer relies on a caught exception when it is missing.
- The uSync.Forms package no longer ships the client source `package.json`,
  `package-lock.json` and `tsconfig.json` as content files.
- uSync.Forms.Complete reports its real version in the backoffice instead of `0.0.0`.

### Changed

- Forms are saved once per import instead of twice.
- Item existence checks use the Forms `Exists` APIs instead of loading every item.
- Removed `CleanseNode` overrides that re-parsed the XML on every comparison without
  changing it.
- Prevalue sources are looked up once per form import instead of once per field.
- Removed unused code: reflection for `FolderId` on export, and the unused
  `IEntityService` constructor argument on `FormSerializer`.
- Removed the empty backoffice entry point from the uSync.Forms client bundle, and added
  the missing data source label.
- The package manifest reports the assembly version instead of a fixed `1.0.0`.
