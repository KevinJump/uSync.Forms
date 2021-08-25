using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Umbraco.Core;
using Umbraco.Core.Cache;
using Umbraco.Core.Logging;
using Umbraco.Core.Scoping;
using Umbraco.Forms.Core;
using Umbraco.Forms.Core.Models;
using Umbraco.Forms.Core.Persistence.Repositories;
using Umbraco.Forms.Core.Services;
using Umbraco.Forms.Data.Storage;

using uSync.Forms.Services;

using uSync8.BackOffice;
using uSync8.BackOffice.Configuration;
using uSync8.BackOffice.Services;
using uSync8.BackOffice.SyncHandlers;
using uSync8.Core;
using uSync8.Core.Serialization;

using static Umbraco.Core.Constants;

namespace uSync.Forms.Handlers
{
    [SyncHandler("formsDataSourceHandler", "DataSource", "Forms-DataSource", uSyncFormPriorities.DataSources,
    Icon = "icon-box usync-addon-icon", EntityType = UdiEntityType.FormsDataSource)]
    public class DataSourceHandler : SyncHandlerRoot<FormDataSource, FormDataSource>,
        ISyncExtendedHandler, ISyncItemHandler
    {
        public override string Group => "Forms";

        private readonly SyncFormService syncFormService;
        private readonly IDataSourceService dataSourceService;
        private readonly IDataSourceStorage dataSourceStorage;

        public DataSourceHandler(IProfilingLogger logger,
            SyncFormService syncFormService,
            IDataSourceStorage dataSourceStorage,
            IDataSourceService dataSourceService,
            AppCaches appCaches, 
            ISyncSerializer<FormDataSource> serializer, 
            ISyncItemFactory itemFactory, 
            SyncFileService syncFileService) 
            : base(logger, appCaches, serializer, itemFactory, syncFileService)
        {
            this.syncFormService = syncFormService;
            this.dataSourceService = dataSourceService;
            this.dataSourceStorage = dataSourceStorage;
        }

        public override IEnumerable<uSyncAction> ExportAll(string folder, HandlerSettings config, SyncUpdateCallback callback)
        {
            var items = syncFormService.GetAllDataSources();

            var actions = new List<uSyncAction>();

            foreach (var item in items)
            {
                callback?.Invoke(GetItemName(item), 2, 4);

                actions.AddRange(this.Export(item, folder, config));
            }
            return actions;
        }

        protected override IEnumerable<uSyncAction> DeleteMissingItems(FormDataSource parent, IEnumerable<Guid> keysToKeep, bool reportOnly)
            => Enumerable.Empty<uSyncAction>();

        protected override void DeleteViaService(FormDataSource item)
            => syncFormService.DeleteDataSource(item);

        protected override IEnumerable<FormDataSource> GetChildItems(FormDataSource parent)
            => Enumerable.Empty<FormDataSource>();

        protected override IEnumerable<FormDataSource> GetFolders(FormDataSource parent)
            => Enumerable.Empty<FormDataSource>();

        protected override FormDataSource GetFromService(int id)
            => null;

        protected override FormDataSource GetFromService(Guid key)
            => syncFormService.GetDataSource(key);

        protected override FormDataSource GetFromService(string alias)
            => syncFormService.GetDataSource(alias);

        protected override FormDataSource GetFromService(FormDataSource item)
            => syncFormService.GetDataSource(item.Id);

        protected override Guid GetItemKey(FormDataSource item)
            => item.Id;

        protected override string GetItemName(FormDataSource item)
            => item.Name;

        protected override string GetItemPath(FormDataSource item, bool useGuid, bool isFlat)
            => item.Name.ToSafeFileName();

        protected override void InitializeEvents(HandlerSettings settings)
        {
            if (Configuration.StoreUmbracoFormsInDb)
            {
                dataSourceService.Saved += DataSource_Saved;
                dataSourceService.Deleted += DataSource_Deleted;
            }
            else
            {
                dataSourceStorage.Saved += DataSource_Saved;
                dataSourceStorage.Deleted += DataSource_Deleted;
            }
        }

        private void DataSource_Deleted(object sender, FormDataSourceEventArgs e)
        {
            if (uSync8BackOffice.eventsPaused || e.FormDataSource == null) return;

            var filename = GetPath(Path.Combine(rootFolder, this.DefaultFolder), e.FormDataSource, DefaultConfig.GuidNames, DefaultConfig.UseFlatStructure);

            var attempt = serializer.SerializeEmpty(e.FormDataSource, SyncActionType.Delete, string.Empty);
            if (attempt.Success)
            {
                syncFileService.SaveXElement(attempt.Item, filename);
                this.CleanUp(e.FormDataSource, filename, Path.Combine(rootFolder, DefaultFolder));
            }
        }

        private void DataSource_Saved(object sender, FormDataSourceEventArgs e)
        {
            if (uSync8BackOffice.eventsPaused) return;

            var attempts = this.Export(e.FormDataSource, Path.Combine(rootFolder, this.DefaultFolder), this.DefaultConfig);

            foreach(var attempt in attempts.Where(x => x.Success))
            {
                this.CleanUp(e.FormDataSource, attempt.FileName, Path.Combine(rootFolder, this.DefaultFolder));
            }
        }
    }
}
