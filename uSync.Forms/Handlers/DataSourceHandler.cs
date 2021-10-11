using Microsoft.Extensions.Logging;

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

using Umbraco.Cms.Core.Cache;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Strings;
using Umbraco.Extensions;
using Umbraco.Forms.Core;
using Umbraco.Forms.Core.Services.Notifications;

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
        INotificationHandler<DataSourceSavedNotification>,
        INotificationHandler<DataSourceDeletedNotification>
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


        public override IEnumerable<uSyncAction> ExportAll(string folder, HandlerSettings config, SyncUpdateCallback callback)
        {
            var items = syncFormService.GetAllDataSources();

            var actions = new List<uSyncAction>();

            foreach (var item in items)
            {
                callback?.Invoke(GetItemName(item), 2, 4);

                actions.AddRange(this.Export(item, folder, config));
            }
            return actions;
        }

        protected override IEnumerable<uSyncAction> DeleteMissingItems(FormDataSource parent, IEnumerable<Guid> keysToKeep, bool reportOnly)
            => Enumerable.Empty<uSyncAction>();

        protected override void DeleteViaService(FormDataSource item)
            => syncFormService.DeleteDataSource(item);

        protected override IEnumerable<FormDataSource> GetChildItems(FormDataSource parent)
            => Enumerable.Empty<FormDataSource>();

        protected override IEnumerable<FormDataSource> GetFolders(FormDataSource parent)
            => Enumerable.Empty<FormDataSource>();

        protected override string GetItemPath(FormDataSource item, bool useGuid, bool isFlat)
            => item.Name.ToSafeFileName(shortStringHelper);

        protected override FormDataSource GetFromService(FormDataSource item)
            => syncFormService.GetDataSource(item.Id);

        protected override string GetItemName(FormDataSource item)
            => item.Name;

        public void Handle(DataSourceDeletedNotification notification)
        {
            if (!ShouldProcess()) return;

            foreach (var dataSource in notification.DeletedEntities)
            {

                var filename = GetPath(Path.Combine(rootFolder, this.DefaultFolder), dataSource, DefaultConfig.GuidNames, DefaultConfig.UseFlatStructure);

                var attempt = serializer.SerializeEmpty(dataSource, SyncActionType.Delete, string.Empty);
                if (attempt.Success)
                {
                    syncFileService.SaveXElement(attempt.Item, filename);
                    this.CleanUp(dataSource, filename, Path.Combine(rootFolder, DefaultFolder));
                }
            }
        }

        public void Handle(DataSourceSavedNotification notification)
        {
            if (!ShouldProcess()) return;

            foreach(var dataSource in notification.SavedEntities)
            {
                var attempts = this.Export(dataSource, Path.Combine(rootFolder, this.DefaultFolder), this.DefaultConfig);

                foreach (var attempt in attempts.Where(x => x.Success))
                {
                    this.CleanUp(dataSource, attempt.FileName, Path.Combine(rootFolder, this.DefaultFolder));
                }
            }
        }

        private bool ShouldProcess()
        {
            if (_mutexService.IsPaused) return false;
            if (!DefaultConfig.Enabled) return false;
            return true;
        }
    }
}
