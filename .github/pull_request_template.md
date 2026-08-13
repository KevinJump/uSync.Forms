## What does this change?

<!-- A sentence or two on the change and why it is needed. -->

## Notes for the reviewer

<!-- Anything non-obvious: behaviour changes, things you decided against, areas you want a
     second opinion on. Delete if there is nothing to say. -->

## Checklist

- [ ] `dotnet build uSync.Forms.slnx -c Release` is clean
- [ ] `npm run build` passes in `uSync.Forms/forms-client` and `uSync.Forms.Complete/Client`
- [ ] `CHANGELOG.md` updated under **Unreleased**
- [ ] If a dependency changed, `dotnet restore --force-evaluate` was run and the updated
      `packages.lock.json` is committed
- [ ] Backoffice changes were clicked through in a running site (`uSync.Forms.Site`), not
      just built
