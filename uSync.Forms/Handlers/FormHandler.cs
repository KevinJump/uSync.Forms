using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Umbraco.Core;
using Umbraco.Core.Cache;
using Umbraco.Core.Logging;
using Umbraco.Core.Services;
using Umbraco.Forms.Core;
using Umbraco.Forms.Core.Data.Storage;
using Umbraco.Forms.Core.Models;
using Umbraco.Forms.Core.Services;

using uSync.Forms.Services;

using uSync8.BackOffice;
using uSync8.BackOffice.Configuration;
using uSync8.BackOffice.Services;
using uSync8.BackOffice.SyncHandlers;
using uSync8.Core;
using uSync8.Core.Dependency;
using uSync8.Core.Serialization;
using uSync8.Core.Tracking;

using static Umbraco.Core.Constants;

namespace uSync.Forms.Handlers
{
    [SyncHandler("formsHandler", "Forms", "Forms", uSyncFormPriorities.Forms, 
        Icon = "icon-umb-contour usync-addon-icon", EntityType = UdiEntityType.FormsForm)]
    public class FormHandler : SyncHandlerRoot<Form, Form>, ISyncExtendedHandler, ISyncItemHandler
    {
        public override string Group => "Forms";


        private readonly SyncFormService syncFormService;

        private readonly IFormService formService;
        private readonly IFormStorage formStorage;

        public FormHandler(IProfilingLogger logger,
            SyncFormService syncFormService,
            IFormService formService,
            IFormStorage formStorage,
            AppCaches appCaches, 
            ISyncSerializer<Form> serializer, 
            ISyncItemFactory itemFactory, 
            SyncFileService syncFileService) 
            : base(logger, appCaches, serializer, itemFactory, syncFileService)
        {
            this.syncFormService = syncFormService;

            this.formService = formService;
            this.formStorage = formStorage;
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

        protected override void DeleteViaService(Form item)
            => syncFormService.DeleteForm(item);

        protected override Form GetFromService(int id)
            => null;
        protected override Form GetFromService(Guid key)
            => syncFormService.GetForm(key);

        protected override Form GetFromService(string alias)
            => syncFormService.GetForm(alias);

        protected override Guid GetItemKey(Form item)
            => item.Id;

        protected override string GetItemName(Form item)
            => item.Name;

        protected override string GetItemPath(Form item, bool useGuid, bool isFlat)
            => item.Name.ToSafeFileName();

        protected override void InitializeEvents(HandlerSettings settings)
        {

            if (Configuration.StoreUmbracoFormsInDb)
            {
                formService.Saved += Form_Saved;
                formService.Deleted += Form_Deleted;
            }
            else
            {
                formStorage.Saved += Form_Saved;
                formStorage.Deleted += Form_Deleted;
            }
        }

        private void Form_Deleted(object sender, FormEventArgs e)
        {
            if (uSync8BackOffice.eventsPaused) return;

            var filename = GetPath(Path.Combine(rootFolder, this.DefaultFolder), e.Form,
                DefaultConfig.GuidNames, DefaultConfig.UseFlatStructure);

            var attempt = serializer.SerializeEmpty(e.Form, SyncActionType.Delete, string.Empty);
            if (attempt.Success)
            {
                syncFileService.SaveXElement(attempt.Item, filename);
                this.CleanUp(e.Form, filename, Path.Combine(rootFolder, DefaultFolder));
            }
        }

        private void Form_Saved(object sender, FormEventArgs e)
        {
            if (uSync8BackOffice.eventsPaused) return;

            try
            {
                var attempts = this.Export(e.Form, Path.Combine(rootFolder, this.DefaultFolder), DefaultConfig);
                foreach (var attempt in attempts.Where(x => x.Success)) {
                    this.CleanUp(e.Form, attempt.FileName, Path.Combine(rootFolder, this.DefaultFolder));
                }
            }
            catch (Exception ex)
            {
                logger.Warn<FormHandler>(ex, "uSync Save error");
            }
        }

        protected override IEnumerable<Form> GetChildItems(Form parent)
            => Enumerable.Empty<Form>();

        protected override IEnumerable<Form> GetFolders(Form parent)
            => Enumerable.Empty<Form>();

        protected override Form GetFromService(Form item)
            => syncFormService.GetForm(item.Id);
    }
}
