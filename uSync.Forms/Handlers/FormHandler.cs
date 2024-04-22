using System;
using System.Collections.Generic;

using Microsoft.Extensions.Logging;

using Umbraco.Cms.Core.Cache;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Cms.Core.Strings;
using Umbraco.Extensions;
using Umbraco.Forms.Core.Models;

using uSync.BackOffice;
using uSync.BackOffice.Configuration;
using uSync.BackOffice.Services;
using uSync.BackOffice.SyncHandlers;
using uSync.Core;
using uSync.Forms.Services;

using static Umbraco.Cms.Core.Constants;

namespace uSync.Forms.Handlers
{
	[SyncHandler("formsHandler", "Forms", "Forms", uSyncFormPriorities.Forms, 
        Icon = "icon-umb-contour usync-addon-icon", EntityType = UdiEntityType.FormsForm)]
    public class FormHandler : SyncHandlerRoot<Form, Form>, ISyncHandler,
		INotificationHandler<SavedNotification<Form>>,
		INotificationHandler<DeletedNotification<Form>>,
		INotificationHandler<SavingNotification<Form>>,
		INotificationHandler<DeletingNotification<Form>>
	{
		public override string Group => "Forms";

        private readonly SyncFormService _syncFormService;

        public FormHandler(ILogger<SyncHandlerRoot<Form, Form>> logger,
            AppCaches appCaches, 
            IShortStringHelper shortStringHelper,
            SyncFileService syncFileService,
            uSyncEventService mutexService,
            uSyncConfigService uSyncConfig,
            ISyncItemFactory itemFactory,
            SyncFormService syncFormService)
            : base(logger, appCaches, shortStringHelper, syncFileService, mutexService, uSyncConfig, itemFactory)
        {
            this._syncFormService = syncFormService;
        }

        protected override IEnumerable<uSyncAction> DeleteMissingItems(Form parent, IEnumerable<Guid> keysToKeep, bool reportOnly) 
            => [];

        protected override string GetItemName(Form item)
            => item.Name;

        protected override string GetItemPath(Form item, bool useGuid, bool isFlat)
            => item.Name.ToSafeFileName(shortStringHelper);

        protected override IEnumerable<Form> GetChildItems(Form parent)
			=> parent is null ? _syncFormService.GetAllForms() : [];

        protected override IEnumerable<Form> GetFolders(Form parent)
            => [];

        protected override Form GetFromService(Form item)
            => _syncFormService.GetForm(item.Id);
    }
}
