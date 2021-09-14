
using Umbraco.Core;
using Umbraco.Core.Composing;
using Umbraco.Forms.Core;
using Umbraco.Forms.Core.Components;
using Umbraco.Forms.Core.Models;

using uSync.Forms.Serializers;
using uSync.Forms.Services;

using uSync8.BackOffice;
using uSync8.Core;
using uSync8.Core.Serialization;

namespace uSync.Forms
{
    [ComposeAfter(typeof(UmbracoFormsComposer))] // after forms 
    [ComposeAfter(typeof(uSyncCoreComposer))] // after core usync
    [ComposeBefore(typeof(uSyncBackOfficeComposer))] // before usync.backoffice loads the handlers.
    public class uSyncFormsComposer : IUserComposer
    {
        public void Compose(Composition composition)
        {
            composition.RegisterUnique<SyncFormService>();

            composition.RegisterUnique<FormsMapperHelper>();

            composition.Register<ISyncSerializer<Form>, FormSerializer>();
            composition.Register<ISyncSerializer<FieldPreValueSource>, PreValueSerializer>();
            composition.Register<ISyncSerializer<FormDataSource>, DataSourceSerializer>();
        }
    }
}
