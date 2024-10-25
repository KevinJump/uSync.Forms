using Microsoft.Extensions.Logging;

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

using Umbraco.Cms.Core.Cache;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Cms.Core.Strings;
using Umbraco.Extensions;
using Umbraco.Forms.Core;
using Umbraco.Forms.Core.Services;
using Umbraco.Forms.Core.Services.Notifications;

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
    [SyncHandler("formsPreValueHandler", "PreValue", "Forms-PreValues", uSyncFormPriorities.PreValues,
        Icon = "icon-box usync-addon-icon", EntityType = UdiEntityType.FormsPreValue)]
    public class PreValueHandler : SyncHandlerRoot<FieldPreValueSource, FieldPreValueSource>, ISyncHandler,
		INotificationAsyncHandler<SavedNotification<FieldPreValueSource>>,
		INotificationAsyncHandler<DeletedNotification<FieldPreValueSource>>,
        INotificationAsyncHandler<SavingNotification<FieldPreValueSource>>,
		INotificationAsyncHandler<DeletingNotification<FieldPreValueSource>>
	{
		public override string Group => "Forms";

        private readonly SyncFormService syncFormService;

        public PreValueHandler(ILogger<SyncHandlerRoot<FieldPreValueSource, FieldPreValueSource>> logger, 
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

        protected override Task<IEnumerable<uSyncAction>> DeleteMissingItemsAsync(FieldPreValueSource parent, IEnumerable<Guid> keysToKeep, bool reportOnly)
            => Task.FromResult(Enumerable.Empty<uSyncAction>());

        protected override Task DeleteViaServiceAsync(FieldPreValueSource item)
            => uSyncTaskHelper.FromResultOf(() => syncFormService.DeletePreValueSource(item));

        protected override Task<IEnumerable<FieldPreValueSource>> GetChildItemsAsync(FieldPreValueSource? parent)
            => uSyncTaskHelper.FromResultOf(() => parent is null ? syncFormService.GetAllPreValues() : []);

        protected override Task<IEnumerable<FieldPreValueSource>> GetFoldersAsync(FieldPreValueSource? parent)
            => Task.FromResult(Enumerable.Empty<FieldPreValueSource>());

        protected override string GetItemName(FieldPreValueSource item)
            => item.Name;

        protected override string GetItemPath(FieldPreValueSource item, bool useGuid, bool isFlat)
            => item.Name.ToSafeFileName(shortStringHelper);

        protected override Task<FieldPreValueSource?> GetFromServiceAsync(FieldPreValueSource? item)
            => uSyncTaskHelper.FromResultOf<FieldPreValueSource?>(() => item is null ? null : syncFormService.GetPreValueSource(item.Id));
    }
}
