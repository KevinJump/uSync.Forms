
using Microsoft.Extensions.DependencyInjection;

using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Extensions;
using Umbraco.Forms;
using Umbraco.Forms.Core.Services.Notifications;

using uSync.BackOffice;
using uSync.Forms.Handlers;
using uSync.Forms.ServiceConnectors;
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

            builder.AddNotificationHandler<FormSavedNotification, FormHandler>();
            builder.AddNotificationHandler<FormDeletedNotification, FormHandler>();

            builder.AddNotificationHandler<PrevalueSourceSavedNotification, PreValueHandler>();
            builder.AddNotificationHandler<PrevalueSourceDeletedNotification, PreValueHandler>();

            builder.AddNotificationHandler<DataSourceSavedNotification, DataSourceHandler>();
            builder.AddNotificationHandler<DataSourceDeletedNotification, DataSourceHandler>();

            builder.AddNotificationHandler<FolderSavedNotification, FormsFolderHandler>();
            builder.AddNotificationHandler<FolderDeletedNotification, FormsFolderHandler>();

            UdiParserServiceConnectors.RegisterServiceConnector<FormsFolderServiceConnector>();

            return builder;
        }
    }
}
