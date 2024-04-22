using System;
using System.Collections.Generic;

using Microsoft.Extensions.Logging;

using Umbraco.Cms.Core.Cache;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Cms.Core.Strings;
using Umbraco.Forms.Core.Models;

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
		INotificationHandler<SavedNotification<Folder>>,
		INotificationHandler<DeletedNotification<Folder>>,
		INotificationHandler<SavingNotification<Folder>>,
		INotificationHandler<DeletingNotification<Folder>>
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
            => [];

        protected override IEnumerable<Folder> GetChildItems(Folder parent)
            => _syncFormService.GetChildFolders(parent?.Id);

        protected override Folder GetFromService(Folder item)
            => _syncFormService.GetFolder(item.Id);

        protected override string GetItemName(Folder item)
            => item.Name;

        protected override IEnumerable<Folder> GetFolders(Folder parent)
            => [];
    }
}
