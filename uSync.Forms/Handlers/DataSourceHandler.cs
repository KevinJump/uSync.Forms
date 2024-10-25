using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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
using uSync.BackOffice.SyncHandlers.Interfaces;
using uSync.BackOffice.SyncHandlers.Models;
using uSync.Core;
using uSync.Core.Extensions;
using uSync.Forms.Services;

using static Umbraco.Cms.Core.Constants;

namespace uSync.Forms.Handlers
{
    [SyncHandler("formsDataSourceHandler", "DataSource", "Forms-DataSource", uSyncFormPriorities.DataSources,
    Icon = "icon-box usync-addon-icon", EntityType = UdiEntityType.FormsDataSource)]
    public class DataSourceHandler : SyncHandlerRoot<FormDataSource, FormDataSource>, ISyncHandler,
        INotificationAsyncHandler<SavedNotification<FormDataSource>>,
        INotificationAsyncHandler<DeletedNotification<FormDataSource>>,
        INotificationAsyncHandler<SavingNotification<FormDataSource>>,
        INotificationAsyncHandler<DeletingNotification<FormDataSource>>
    {
        public override string Group => "Forms";

        private readonly SyncFormService syncFormService;

        public DataSourceHandler(
            ILogger<SyncHandlerRoot<FormDataSource, FormDataSource>> logger,
            AppCaches appCaches,
            IShortStringHelper shortStringHelper,
            ISyncFileService syncFileService,
            ISyncEventService mutexService,
            ISyncConfigService uSyncConfig,
            ISyncItemFactory itemFactory,
            SyncFormService syncFormService)
            : base(logger, appCaches, shortStringHelper, syncFileService, mutexService, uSyncConfig, itemFactory)
        {
            this.syncFormService = syncFormService;
        }

        protected override Task<IEnumerable<uSyncAction>> DeleteMissingItemsAsync(FormDataSource parent, IEnumerable<Guid> keysToKeep, bool reportOnly)
            => Task.FromResult(Enumerable.Empty<uSyncAction>());

        protected override Task DeleteViaServiceAsync(FormDataSource item)
            => uSyncTaskHelper.FromResultOf(() => syncFormService.DeleteDataSource(item));

        protected override Task<IEnumerable<FormDataSource>> GetChildItemsAsync(FormDataSource parent)
            => uSyncTaskHelper.FromResultOf(() => {
                return parent == null ? syncFormService.GetAllDataSources() : [];
            });

        protected override Task<IEnumerable<FormDataSource>> GetFoldersAsync(FormDataSource parent)
            => uSyncTaskHelper.FromResultOf(() => Enumerable.Empty<FormDataSource>());

        protected override string GetItemPath(FormDataSource item, bool useGuid, bool isFlat)
            => item.Name.ToSafeFileName(shortStringHelper);

        protected override Task<FormDataSource> GetFromServiceAsync(FormDataSource item)
            => uSyncTaskHelper.FromResultOf(() => syncFormService.GetDataSource(item.Id));

        protected override string GetItemName(FormDataSource item)
            => item.Name;    
    }
}
