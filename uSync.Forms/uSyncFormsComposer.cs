﻿
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Extensions;
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

            builder.Services.AddUnique<SyncFormService>();
            builder.Services.AddUnique<FormsMapperHelper>();

            builder.AddNotificationHandler<FormSavedNotification, FormHandler>();
            builder.AddNotificationHandler<FormDeletedNotification, FormHandler>();

            builder.AddNotificationHandler<PrevalueSourceSavedNotification, PreValueHandler>();
            builder.AddNotificationHandler<PrevalueSourceDeletedNotification, PreValueHandler>();

            builder.AddNotificationHandler<DataSourceSavedNotification, DataSourceHandler>();
            builder.AddNotificationHandler<DataSourceDeletedNotification, DataSourceHandler>();

            return builder;
        }
    }
}
