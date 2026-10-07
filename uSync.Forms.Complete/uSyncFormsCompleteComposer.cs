using Microsoft.Extensions.DependencyInjection;

using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Infrastructure.Manifest;

namespace uSync.Forms.Complete;

public class uSyncFormsCompleteComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddSingleton<IPackageManifestReader, uSyncFormsCompleteManifestReader>();
    }
}
