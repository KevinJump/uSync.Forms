using Microsoft.Extensions.Logging;

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

using Umbraco.Cms.Core.Cache;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Strings;
using Umbraco.Extensions;
using Umbraco.Forms.Core.Models;
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
    [SyncHandler("formsHandler", "Forms", "Forms", uSyncFormPriorities.Forms, 
        Icon = "icon-umb-contour usync-addon-icon", EntityType = UdiEntityType.FormsForm)]
    public class FormHandler : SyncHandlerRoot<Form, Form>, ISyncHandler,
        INotificationHandler<FormSavedNotification>,
        INotificationHandler<FormDeletedNotification>

    {
        /*
        public string[] EntityTypes => new string[]
        {
            UdiEntityType.FormsForm,
            uSyncForms.FolderEntityType
        };*/

        public override string Group => "Forms";

        private readonly SyncFormService syncFormService;

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
            this.syncFormService = syncFormService;
        }


        public override IEnumerable<uSyncAction> ExportAll(string folder, HandlerSettings config, SyncUpdateCallback callback)
        {
            var items = syncFormService.GetAllForms();

            var actions = new List<uSyncAction>();

            foreach(var item in items)
            {
                

                callback?.Invoke(GetItemName(item), 2, 4);
                actions.AddRange(Export(item, folder, config));
            }

            return actions;
        }

        protected override IEnumerable<uSyncAction> DeleteMissingItems(Form parent, IEnumerable<Guid> keysToKeep, bool reportOnly)
        {
            return Enumerable.Empty<uSyncAction>();
        }

        protected override string GetItemName(Form item)
            => item.Name;

        protected override string GetItemPath(Form item, bool useGuid, bool isFlat)
            => item.Name.ToSafeFileName(shortStringHelper);


        public void Handle(FormDeletedNotification notification)
        {
            if (!ShouldProcess()) return;

            foreach (var form in notification.DeletedEntities)
            {
                var filename = GetPath(Path.Combine(rootFolder, this.DefaultFolder), form,
                    DefaultConfig.GuidNames, DefaultConfig.UseFlatStructure);

                var attempt = serializer.SerializeEmpty(form, SyncActionType.Delete, string.Empty);
                if (attempt.Success)
                {
                    syncFileService.SaveXElement(attempt.Item, filename);
                    this.CleanUp(form, filename, Path.Combine(rootFolder, DefaultFolder));
                }
            }
        }

        public void Handle(FormSavedNotification notification)
        {
            if (!ShouldProcess()) return;

            try
            {
                foreach (var form in notification.SavedEntities)
                {

                    var attempts = this.Export(form, Path.Combine(rootFolder, this.DefaultFolder), DefaultConfig);
                    foreach (var attempt in attempts.Where(x => x.Success))
                    {
                        this.CleanUp(form, attempt.FileName, Path.Combine(rootFolder, this.DefaultFolder));
                    }
                }
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "uSync Save error");
            }
        }

        protected override IEnumerable<Form> GetChildItems(Form parent)
            => Enumerable.Empty<Form>();

        protected override IEnumerable<Form> GetFolders(Form parent)
            => Enumerable.Empty<Form>();

        protected override Form GetFromService(Form item)
            => syncFormService.GetForm(item.Id);

        private bool ShouldProcess()
        {
            if (_mutexService.IsPaused) return false;
            if (!DefaultConfig.Enabled) return false;
            return true;
        }
    }
}
