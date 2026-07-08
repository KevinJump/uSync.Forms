
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

using System.Linq;

using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Media.EmbedProviders;
using Umbraco.Cms.Infrastructure.Manifest;
using Umbraco.Forms;
using Umbraco.Forms.Core.Services.Notifications;

using uSync.BackOffice;
using uSync.Core.Extensions;
using uSync.Forms.Handlers;
using uSync.Forms.Services;

namespace uSync.Forms
{
    [ComposeAfter(typeof(UmbracoFormsComposer))]
    public class uSyncFormsComposer : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
        {
            builder.AdduSyncForms();
        }
    }

    public static class BuilderuSyncFormsExtension
    {
        public static IUmbracoBuilder AdduSyncForms(this IUmbracoBuilder builder) 
        {
            // don't load backoffice isn't loaded (frontend only).
            if (builder.IsUmbracoBackOfficeEnabled() is false)
                return builder;

            // don't run twice (if something adds builder.AdduSyncForms() outside of the default composer)
            if (builder.Services.FirstOrDefault(x => x.ServiceType == typeof(SyncFormService)) is not null)
                return builder;

            // builder.AddUmbracoFormsCore();
            builder.AdduSync();

            builder.Services.AddSingleton<SyncFormService>();
            builder.Services.AddSingleton<FormsMapperHelper>();
			builder.Services.AddOptions<uSyncFormsOptions>().Bind(builder.Config.GetSection(uSyncFormsOptions.Section));

            builder.AddNotificationAsyncHandler<FormSavedNotification, FormHandler>()
                .AddNotificationAsyncHandler<FormDeletedNotification, FormHandler>()
                .AddNotificationAsyncHandler<PrevalueSourceSavedNotification, PreValueHandler>()
                .AddNotificationAsyncHandler<PrevalueSourceDeletedNotification, PreValueHandler>()
                .AddNotificationAsyncHandler<DataSourceSavedNotification, DataSourceHandler>()
                .AddNotificationAsyncHandler<DataSourceDeletedNotification, DataSourceHandler>()
                .AddNotificationAsyncHandler<FolderSavedNotification, FormsFolderHandler>()
                .AddNotificationAsyncHandler<FolderDeletedNotification, FormsFolderHandler>();

            // roots, saving and deleting to stop overwrittes
            builder.AddNotificationAsyncHandler<FormSavingNotification, FormHandler>()
				.AddNotificationAsyncHandler<FormDeletingNotification, FormHandler>()
			    .AddNotificationAsyncHandler<PrevalueSourceSavingNotification, PreValueHandler>()
                .AddNotificationAsyncHandler<PrevalueSourceDeletingNotification, PreValueHandler>()
                .AddNotificationAsyncHandler<DataSourceSavingNotification, DataSourceHandler>()
                .AddNotificationAsyncHandler<DataSourceDeletingNotification, DataSourceHandler>()
                .AddNotificationAsyncHandler<FolderSavingNotification, FormsFolderHandler>()
                .AddNotificationAsyncHandler<FolderDeletingNotification, FormsFolderHandler>();

			UdiParser.RegisterUdiType(uSyncForms.FolderEntityType, UdiType.GuidUdi);

            // try add, so we don't add the manifest twice (shouldn't be possible with service check at the top!). 
            builder.Services.TryAddEnumerable(ServiceDescriptor.Singleton<IPackageManifestReader, uSyncFormsManifestReader>());

            return builder;
        }
    }
}
