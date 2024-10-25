
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

            return builder;
        }
    }
}
