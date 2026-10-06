using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Nodes;
using System.Threading.Tasks;

using Umbraco.Cms.Core.Manifest;
using Umbraco.Cms.Infrastructure.Manifest;
using Umbraco.Extensions;

namespace uSync.Forms;
internal class uSyncFormsManifestReader : IPackageManifestReader
{
    public Task<IEnumerable<PackageManifest>> ReadPackageManifestsAsync()
    {
        PackageManifest manifest = new()
        {
            Id = "uSync.Forms",
            Name = "uSync.Forms",
            AllowTelemetry = true,
            Version = typeof(uSyncFormsManifestReader).Assembly.GetName().Version?.ToString(3) ?? "17.0.0",
            Extensions = [
                new JsonObject {
                    ["name"] = "uSync.Forms bundle",
                    ["alias"] = "uSync.Forms.Bundle",
                    ["type"] = "bundle",
                    ["js"] = "/App_Plugins/uSync.Forms/bundle.js",
                }
            ]
        };

        return Task.FromResult<IEnumerable<PackageManifest>>([manifest]);
    }
}
