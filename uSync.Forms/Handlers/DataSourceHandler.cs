using System;
using System.Collections.Generic;
using System.Linq;

using Microsoft.Extensions.Logging;

using Umbraco.Cms.Core.Cache;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Cms.Core.Strings;
using Umbraco.Extensions;
using Umbraco.Forms.Core;

using uSync.BackOffice;
using uSync.BackOffice.Configuration;
using uSync.BackOffice.Services;
using uSync.BackOffice.SyncHandlers;
using uSync.Core;
using uSync.Forms.Services;

using static Umbraco.Cms.Core.Constants;

namespace uSync.Forms.Handlers
{
	[SyncHandler("formsDataSourceHandler", "DataSource", "Forms-DataSource", uSyncFormPriorities.DataSources,
    Icon = "icon-box usync-addon-icon", EntityType = UdiEntityType.FormsDataSource)]
    public class DataSourceHandler : SyncHandlerRoot<FormDataSource, FormDataSource>, ISyncHandler,
		INotificationHandler<SavedNotification<FormDataSource>>,
		INotificationHandler<DeletedNotification<FormDataSource>>,
		INotificationHandler<SavingNotification<FormDataSource>>,
		INotificationHandler<DeletingNotification<FormDataSource>>
	{
		public override string Group => "Forms";

        private readonly SyncFormService syncFormService;

        public DataSourceHandler(
            ILogger<SyncHandlerRoot<FormDataSource, FormDataSource>> logger, 
            AppCaches appCaches, 
            IShortStringHelper shortStringHelper, 
            SyncFileService syncFileService, 
            uSyncEventService mutexService, 
            uSyncConfigService uSyncConfig, 
            ISyncItemFactory itemFactory,
            SyncFormService syncFormService)
            : base(logger, appCaches, shortStringHelper, syncFileService, mutexService, uSyncConfig, itemFactory)
        {
            this.syncFormService = syncFormService;
        }

        protected override IEnumerable<uSyncAction> DeleteMissingItems(FormDataSource parent, IEnumerable<Guid> keysToKeep, bool reportOnly)
            => Enumerable.Empty<uSyncAction>();

        protected override void DeleteViaService(FormDataSource item)
            => syncFormService.DeleteDataSource(item);

        protected override IEnumerable<FormDataSource> GetChildItems(FormDataSource parent)
            => parent == null ? syncFormService.GetAllDataSources() : [];

        protected override IEnumerable<FormDataSource> GetFolders(FormDataSource parent)
            => [];

        protected override string GetItemPath(FormDataSource item, bool useGuid, bool isFlat)
            => item.Name.ToSafeFileName(shortStringHelper);

        protected override FormDataSource GetFromService(FormDataSource item)
            => syncFormService.GetDataSource(item.Id);

        protected override string GetItemName(FormDataSource item)
            => item.Name;    
    }
}
