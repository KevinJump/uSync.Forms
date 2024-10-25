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
using Umbraco.Forms.Core.Models;

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
	[SyncHandler("formsHandler", "Forms", "Forms", uSyncFormPriorities.Forms, 
        Icon = "icon-umb-contour usync-addon-icon", EntityType = UdiEntityType.FormsForm)]
    public class FormHandler : SyncHandlerRoot<Form, Form>, ISyncHandler,
		INotificationAsyncHandler<SavedNotification<Form>>,
		INotificationAsyncHandler<DeletedNotification<Form>>,
		INotificationAsyncHandler<SavingNotification<Form>>,
		INotificationAsyncHandler<DeletingNotification<Form>>
	{
		public override string Group => "Forms";

        private readonly SyncFormService _syncFormService;

        public FormHandler(ILogger<SyncHandlerRoot<Form, Form>> logger,
            AppCaches appCaches, 
            IShortStringHelper shortStringHelper,
            ISyncFileService syncFileService,
            ISyncEventService mutexService,
            ISyncConfigService uSyncConfig,
            ISyncItemFactory itemFactory,
            SyncFormService syncFormService)
            : base(logger, appCaches, shortStringHelper, syncFileService, mutexService, uSyncConfig, itemFactory)
        {
            this._syncFormService = syncFormService;
        }

        protected override Task<IEnumerable<uSyncAction>> DeleteMissingItemsAsync(Form parent, IEnumerable<Guid> keysToKeep, bool reportOnly)
            => Task.FromResult(Enumerable.Empty<uSyncAction>());

        protected override string GetItemName(Form item)
            => item.Name;

        protected override string GetItemPath(Form item, bool useGuid, bool isFlat)
            => item.Name.ToSafeFileName(shortStringHelper);


        protected override Task<IEnumerable<Form>> GetChildItemsAsync(Form? parent)
            => uSyncTaskHelper.FromResultOf(() =>
            {
                return parent == null ? _syncFormService.GetAllForms() : [];
            });


        protected override Task<IEnumerable<Form>> GetFoldersAsync(Form? parent)
            => uSyncTaskHelper.FromResultOf(() => Enumerable.Empty<Form>());

        protected override Task<Form?> GetFromServiceAsync(Form? item)
            => uSyncTaskHelper.FromResultOf<Form?>(() => item is null ? null : _syncFormService.GetForm(item.Id));
    }
}
