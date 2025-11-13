using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Umbraco.Cms.Core.Cache;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Cms.Core.Strings;
using Umbraco.Forms.Core.Models;

using uSync.BackOffice;
using uSync.BackOffice.Configuration;
using uSync.BackOffice.Models;
using uSync.BackOffice.Services;
using uSync.BackOffice.SyncHandlers;
using uSync.BackOffice.SyncHandlers.Interfaces;
using uSync.BackOffice.SyncHandlers.Models;
using uSync.Core;
using uSync.Core.Extensions;
using uSync.Forms.Services;

namespace uSync.Forms.Handlers
{
	[SyncHandler("folderHander", "Folders", "Form-Folders", uSyncFormPriorities.Folders,
     Icon = "icon-folder", EntityType = uSyncForms.FolderEntityType)]
    public class FormsFolderHandler : SyncHandlerRoot<Folder, Folder>, ISyncHandler,
		INotificationAsyncHandler<SavedNotification<Folder>>,
		INotificationAsyncHandler<DeletedNotification<Folder>>,
		INotificationAsyncHandler<SavingNotification<Folder>>,
		INotificationAsyncHandler<DeletingNotification<Folder>>
	{
		public override string Group => "Forms";

        private SyncFormService _syncFormService;

        public FormsFolderHandler(ILogger<SyncHandlerRoot<Folder, Folder>> logger, 
            AppCaches appCaches, 
            IShortStringHelper shortStringHelper, 
            ISyncFileService syncFileService, 
            ISyncEventService mutexService, 
            ISyncConfigService uSyncConfig, 
            ISyncItemFactory itemFactory,
            SyncFormService syncFormService) 
            : base(logger, appCaches, shortStringHelper, syncFileService, mutexService, uSyncConfig, itemFactory)
        {
            _syncFormService = syncFormService;

            this.ItemContainerType = Umbraco.Cms.Core.Models.UmbracoObjectTypes.Unknown;
        }

        protected override async Task<IReadOnlyList<OrderedNodeInfo>> GetMergedItemsAsync(string[] folders, SyncMergeOptions options)
        {
            var items = await base.GetMergedItemsAsync(folders, options);      
            return [.. items.OrderBy(x=>x.Level)];
        }

        protected override Task<IEnumerable<uSyncAction>> DeleteMissingItemsAsync(Folder parent, IEnumerable<Guid> keysToKeep, bool reportOnly)
            => Task.FromResult(Enumerable.Empty<uSyncAction>());

        protected override Task<IEnumerable<Folder>> GetChildItemsAsync(Folder? parent)
            => uSyncTaskHelper.FromResultOf(() => _syncFormService.GetChildFolders(parent?.Id));

        protected override Task<Folder?> GetFromServiceAsync(Folder? item)
            => uSyncTaskHelper.FromResultOf<Folder?>(() => item is null ? null : _syncFormService.GetFolder(item.Id));

        protected override string GetItemName(Folder item)
            => item.Name;

        protected override Task<IEnumerable<Folder>> GetFoldersAsync(Folder? parent)
            => Task.FromResult(Enumerable.Empty<Folder>());
    }
}
