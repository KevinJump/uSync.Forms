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
using Umbraco.Forms.Core.Services;
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
    [SyncHandler("formsPreValueHandler", "PreValue", "Forms-PreValues", uSyncFormPriorities.PreValues,
        Icon = "icon-box usync-addon-icon", EntityType = UdiEntityType.FormsPreValue)]
    public class PreValueHandler : SyncHandlerRoot<FieldPreValueSource, FieldPreValueSource>, ISyncHandler,
        INotificationHandler<PrevalueSourceSavedNotification>,
        INotificationHandler<PrevalueSourceDeletedNotification>
    {
        public override string Group => "Forms";

        private readonly SyncFormService syncFormService;

        public PreValueHandler(ILogger<SyncHandlerRoot<FieldPreValueSource, FieldPreValueSource>> logger, 
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
            var items = syncFormService.GetAllPreValues();

            var actions = new List<uSyncAction>();

            foreach(var item in items.Cast<FieldPreValueSource>())
            {
                callback?.Invoke(GetItemName(item), 1, 2);
                actions.AddRange(Export(item, folder, config));
            }

            return actions;
        }

        protected override IEnumerable<uSyncAction> DeleteMissingItems(FieldPreValueSource parent, IEnumerable<Guid> keysToKeep, bool reportOnly)
        {
            return Enumerable.Empty<uSyncAction>();
        }

        protected override void DeleteViaService(FieldPreValueSource item)
            => syncFormService.DeletePreValueSource(item);

        protected override IEnumerable<FieldPreValueSource> GetChildItems(FieldPreValueSource parent)
            => Enumerable.Empty<FieldPreValueSource>();

        protected override IEnumerable<FieldPreValueSource> GetFolders(FieldPreValueSource parent)
            => Enumerable.Empty<FieldPreValueSource>();

     
        protected override string GetItemName(FieldPreValueSource item)
            => item.Name;

        protected override string GetItemPath(FieldPreValueSource item, bool useGuid, bool isFlat)
            => item.Name.ToSafeFileName(shortStringHelper);

        private bool ShouldProcess()
        {
            if (_mutexService.IsPaused) return false;
            if (!DefaultConfig.Enabled) return false;
            return true;
        }

        protected override FieldPreValueSource GetFromService(FieldPreValueSource item)
            => syncFormService.GetPreValueSource(item.Id);

        public void Handle(PrevalueSourceDeletedNotification notification)
        {
            if (!ShouldProcess()) return;

            foreach (var preValue in notification.DeletedEntities.Cast<FieldPreValueSource>())
            {
                var filename = GetPath(Path.Combine(rootFolder, this.DefaultFolder), preValue, DefaultConfig.GuidNames, DefaultConfig.UseFlatStructure);

                var attempt = serializer.SerializeEmpty(preValue, SyncActionType.Delete, string.Empty);
                if (attempt.Success)
                {
                    syncFileService.SaveXElement(attempt.Item, filename);
                    this.CleanUp(preValue, filename, Path.Combine(rootFolder, DefaultFolder));
                }
            }
        }

        public void Handle(PrevalueSourceSavedNotification notification)
        {
            if (!ShouldProcess()) return;
            try
            {
                foreach (var preValue in notification.SavedEntities.Cast<FieldPreValueSource>())
                {
                    var attempts = this.Export(preValue,
                        Path.Combine(rootFolder, this.DefaultFolder), this.DefaultConfig);

                    foreach (var attempt in attempts.Where(x => x.Success))
                    {
                        this.CleanUp(preValue, attempt.FileName, Path.Combine(rootFolder, this.DefaultFolder));
                    }
                }

            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "uSync Save error");
            }
        }
    }
}
