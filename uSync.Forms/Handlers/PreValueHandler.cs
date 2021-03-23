using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

using Umbraco.Core;
using Umbraco.Core.Cache;
using Umbraco.Core.Logging;
using Umbraco.Forms.Core;
using Umbraco.Forms.Core.Services;
using Umbraco.Forms.Data.Storage;

using uSync.Forms.Services;

using uSync8.BackOffice;
using uSync8.BackOffice.Configuration;
using uSync8.BackOffice.Services;
using uSync8.BackOffice.SyncHandlers;
using uSync8.Core;
using uSync8.Core.Serialization;

namespace uSync.Forms.Handlers
{
    [SyncHandler("formsPreValueHandler", "PreValue", "Forms-PreValues", uSyncFormPriorities.PreValues,
        Icon = "icon-box usync-addon-icon", EntityType = "PreValue")]
    public class PreValueHandler : SyncHandlerRoot<FieldPreValueSource, FieldPreValueSource>,
        ISyncExtendedHandler, ISyncItemHandler
    {
        public override string Group => "Forms";

        private readonly SyncFormService syncFormService;

        private readonly IPrevalueSourceStorage prevalueSourceStorage;
        private readonly IPrevalueSourceService prevalueSourceService;

        public PreValueHandler(IProfilingLogger logger, 
            SyncFormService syncFormService,
            IPrevalueSourceService prevalueSourceService,
            IPrevalueSourceStorage prevalueSourceStorage,
            AppCaches appCaches, 
            ISyncSerializer<FieldPreValueSource> serializer, 
            ISyncItemFactory itemFactory, 
            SyncFileService syncFileService) 
            : base(logger, appCaches, serializer, itemFactory, syncFileService)
        {
            this.syncFormService = syncFormService;

            this.prevalueSourceService = prevalueSourceService;
            this.prevalueSourceStorage = prevalueSourceStorage;
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

        protected override FieldPreValueSource GetFromService(int id)
            => null;

        protected override FieldPreValueSource GetFromService(Guid key)
            => syncFormService.GetPreValueSource(key);

        protected override FieldPreValueSource GetFromService(string alias)
            => syncFormService.GetPreValueSource(alias);

        protected override FieldPreValueSource GetFromService(FieldPreValueSource item)
            => syncFormService.GetPreValueSource(item.Id);

        protected override Guid GetItemKey(FieldPreValueSource item)
            => item.Id;

        protected override string GetItemName(FieldPreValueSource item)
            => item.Name;

        protected override string GetItemPath(FieldPreValueSource item, bool useGuid, bool isFlat)
            => item.Name.ToSafeFileName();

        protected override void InitializeEvents(HandlerSettings settings)
        {
            if (Configuration.StoreUmbracoFormsInDb)
            {
                prevalueSourceService.Saved += PrevalueSource_Saved;
                prevalueSourceService.Deleted += PrevalueSource_Deleted;
            }
            else
            {
                prevalueSourceStorage.Saved += PrevalueSource_Saved;
                prevalueSourceStorage.Deleted += PrevalueSource_Deleted;
            }
        }

        private void PrevalueSource_Deleted(object sender, FieldPreValueSourceEventArgs e)
        {
            if (uSync8BackOffice.eventsPaused || e.FieldPreValueSource == null) return;

            var filename = GetPath(Path.Combine(rootFolder, this.DefaultFolder), (FieldPreValueSource)e.FieldPreValueSource, DefaultConfig.GuidNames, DefaultConfig.UseFlatStructure);

            var attempt = serializer.SerializeEmpty((FieldPreValueSource)e.FieldPreValueSource, SyncActionType.Delete, string.Empty);
            if (attempt.Success)
            {
                syncFileService.SaveXElement(attempt.Item, filename);
                this.CleanUp((FieldPreValueSource)e.FieldPreValueSource, filename, Path.Combine(rootFolder, DefaultFolder));
            }
        }

        private void PrevalueSource_Saved(object sender, FieldPreValueSourceEventArgs e)
        {
            if (uSync8BackOffice.eventsPaused) return;

            try
            {
                var attempts = this.Export((FieldPreValueSource)e.FieldPreValueSource,
                    Path.Combine(rootFolder, this.DefaultFolder), this.DefaultConfig);

                foreach (var attempt in attempts.Where(x => x.Success))
                {
                    this.CleanUp((FieldPreValueSource)e.FieldPreValueSource, attempt.FileName, Path.Combine(rootFolder, this.DefaultFolder));
                }

            }
            catch (Exception ex)
            {
                logger.Warn<PreValueHandler>(ex, "uSync Save error");
            }
        }
    }
}
