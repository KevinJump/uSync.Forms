using System.Text.Json.Nodes;

using Umbraco.Cms.Core.Manifest;
using Umbraco.Cms.Infrastructure.Manifest;

namespace uSync.Forms.Complete;

// the manifest is built here rather than in a static umbraco-package.json so the
// version is the assembly's, and not a fixed value that has to be kept in step.
internal class uSyncFormsCompleteManifestReader : IPackageManifestReader
{
    public Task<IEnumerable<PackageManifest>> ReadPackageManifestsAsync()
    {
        PackageManifest manifest = new()
        {
            Id = "uSync.Forms.Complete",
            Name = "uSync.Forms.Complete",
            AllowTelemetry = true,
            Version = typeof(uSyncFormsCompleteManifestReader).Assembly.GetName().Version?.ToString(3) ?? "18.0.0",
            Extensions = [
                new JsonObject {
                    ["name"] = "uSync Forms Complete Bundle",
                    ["alias"] = "uSync.Forms.Complete.Bundle",
                    ["type"] = "bundle",
                    ["js"] = "/App_Plugins/uSyncFormsComplete/u-sync-forms-complete.js",
                }
            ]
        };

        return Task.FromResult<IEnumerable<PackageManifest>>([manifest]);
    }
}
