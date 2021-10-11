using Microsoft.Extensions.Logging;

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

using Umbraco.Cms.Core.Cache;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Strings;
using Umbraco.Forms.Core.Models;
using Umbraco.Forms.Core.Services.Notifications;

using uSync.BackOffice;
using uSync.BackOffice.Configuration;
using uSync.BackOffice.Services;
using uSync.BackOffice.SyncHandlers;
using uSync.Core;
using uSync.Forms.Services;

namespace uSync.Forms.Handlers
{
    [SyncHandler("folderHander", "Folders", "Form-Folders", uSyncFormPriorities.Folders,
     Icon = "icon-folder usync-addon-icon", EntityType = uSyncForms.FolderEntityType)]
    public class FormsFolderHandler : SyncHandlerRoot<Folder, Folder>, ISyncHandler,
        INotificationHandler<FolderSavedNotification>,
        INotificationHandler<FolderDeletedNotification>
    {
        public override string Group => "Forms";

        private SyncFormService _syncFormService;

        public FormsFolderHandler(ILogger<SyncHandlerRoot<Folder, Folder>> logger, 
            AppCaches appCaches, 
            IShortStringHelper shortStringHelper, 
            SyncFileService syncFileService, 
            uSyncEventService mutexService, 
            uSyncConfigService uSyncConfig, 
            ISyncItemFactory itemFactory,
            SyncFormService syncFormService) 
            : base(logger, appCaches, shortStringHelper, syncFileService, mutexService, uSyncConfig, itemFactory)
        {
            _syncFormService = syncFormService;

            this.itemContainerType = Umbraco.Cms.Core.Models.UmbracoObjectTypes.Unknown;
        }

        protected override IEnumerable<uSyncAction> DeleteMissingItems(Folder parent, IEnumerable<Guid> keysToKeep, bool reportOnly)
            => Enumerable.Empty<uSyncAction>();

        protected override IEnumerable<Folder> GetChildItems(Folder parent)
            => _syncFormService.GetChildFolders(parent?.Id);

        protected override Folder GetFromService(Folder item)
            => _syncFormService.GetFolder(item.Id);

        protected override string GetItemName(Folder item)
            => item.Name;

        protected override IEnumerable<Folder> GetFolders(Folder parent)
            => Enumerable.Empty<Folder>();

        public void Handle(FolderSavedNotification notification)
        {
            if (!ShouldProcess()) return;

            try
            {
                foreach (var folder in notification.SavedEntities)
                {

                    var attempts = this.Export(folder, Path.Combine(rootFolder, this.DefaultFolder), DefaultConfig);
                    foreach (var attempt in attempts.Where(x => x.Success))
                    {
                        this.CleanUp(folder, attempt.FileName, Path.Combine(rootFolder, this.DefaultFolder));
                    }
                }
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "uSync Save error");
            }
        }

        public void Handle(FolderDeletedNotification notification)
        {
            if (!ShouldProcess()) return;
            
            foreach (var folder in notification.DeletedEntities)
            {
                var filename = GetPath(Path.Combine(rootFolder, this.DefaultFolder), folder,
                    DefaultConfig.GuidNames, DefaultConfig.UseFlatStructure);

                var attempt = serializer.SerializeEmpty(folder, SyncActionType.Delete, string.Empty);
                if (attempt.Success)
                {
                    syncFileService.SaveXElement(attempt.Item, filename);
                    this.CleanUp(folder, filename, Path.Combine(rootFolder, DefaultFolder));
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
