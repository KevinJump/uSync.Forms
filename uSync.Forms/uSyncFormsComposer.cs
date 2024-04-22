
using Microsoft.Extensions.DependencyInjection;

using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Forms;
using Umbraco.Forms.Core.Services.Notifications;

using uSync.BackOffice;
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
            // builder.AddUmbracoFormsCore();
            builder.AdduSync();

            builder.Services.AddSingleton<SyncFormService>();
            builder.Services.AddSingleton<FormsMapperHelper>();

			builder.AddNotificationHandler<FormSavedNotification, FormHandler>()
				.AddNotificationHandler<FormDeletedNotification, FormHandler>()
				.AddNotificationHandler<PrevalueSourceSavedNotification, PreValueHandler>()
				.AddNotificationHandler<PrevalueSourceDeletedNotification, PreValueHandler>()
				.AddNotificationHandler<DataSourceSavedNotification, DataSourceHandler>()
				.AddNotificationHandler<DataSourceDeletedNotification, DataSourceHandler>()
				.AddNotificationHandler<FolderSavedNotification, FormsFolderHandler>()
				.AddNotificationHandler<FolderDeletedNotification, FormsFolderHandler>();

			// roots, saving and deleting to stop overwrittes
			builder.AddNotificationHandler<FormSavingNotification, FormHandler>()
				.AddNotificationHandler<FormDeletingNotification, FormHandler>()
			    .AddNotificationHandler<PrevalueSourceSavingNotification, PreValueHandler>()
                .AddNotificationHandler<PrevalueSourceDeletingNotification, PreValueHandler>()
                .AddNotificationHandler<DataSourceSavingNotification, DataSourceHandler>()
                .AddNotificationHandler<DataSourceDeletingNotification, DataSourceHandler>()
                .AddNotificationHandler<FolderSavingNotification, FormsFolderHandler>()
                .AddNotificationHandler<FolderDeletingNotification, FormsFolderHandler>();

			UdiParser.RegisterUdiType(uSyncForms.FolderEntityType, UdiType.GuidUdi);

            return builder;
        }
    }
}
