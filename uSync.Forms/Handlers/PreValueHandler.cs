using Microsoft.Extensions.Logging;

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

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
using uSync.Core;
using uSync.Forms.Services;

using static Umbraco.Cms.Core.Constants;

namespace uSync.Forms.Handlers
{
    [SyncHandler("formsPreValueHandler", "PreValue", "Forms-PreValues", uSyncFormPriorities.PreValues,
        Icon = "icon-box usync-addon-icon", EntityType = UdiEntityType.FormsPreValue)]
    public class PreValueHandler : SyncHandlerRoot<FieldPreValueSource, FieldPreValueSource>, ISyncHandler,
		INotificationHandler<SavedNotification<FieldPreValueSource>>,
		INotificationHandler<DeletedNotification<FieldPreValueSource>>,
        INotificationHandler<SavingNotification<FieldPreValueSource>>,
		INotificationHandler<DeletingNotification<FieldPreValueSource>>
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

        protected override IEnumerable<uSyncAction> DeleteMissingItems(FieldPreValueSource parent, IEnumerable<Guid> keysToKeep, bool reportOnly)
            => [];

        protected override void DeleteViaService(FieldPreValueSource item)
            => syncFormService.DeletePreValueSource(item);

        protected override IEnumerable<FieldPreValueSource> GetChildItems(FieldPreValueSource parent)
            => parent is null ? syncFormService.GetAllPreValues() : [];

        protected override IEnumerable<FieldPreValueSource> GetFolders(FieldPreValueSource parent)
            => [];

     
        protected override string GetItemName(FieldPreValueSource item)
            => item.Name;

        protected override string GetItemPath(FieldPreValueSource item, bool useGuid, bool isFlat)
            => item.Name.ToSafeFileName(shortStringHelper);

        protected override FieldPreValueSource GetFromService(FieldPreValueSource item)
            => syncFormService.GetPreValueSource(item.Id);
    }
}
