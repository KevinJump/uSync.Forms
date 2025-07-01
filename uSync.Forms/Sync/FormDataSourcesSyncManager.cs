using Microsoft.Extensions.Logging;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Umbraco.Cms.Core;

using uSync.Core.Dependency;
using uSync.Core.Extensions;
using uSync.Core.Sync;
using uSync.Forms.Services;

using static Umbraco.Cms.Core.Constants;

namespace uSync.Forms.Sync
{
    /// <summary>
    ///  form Sync manager, tells uSync.Complete how to render the push/pull menus.
    /// </summary>
    [SyncItemManager(UdiEntityType.FormsDataSource, "")]
    public class FormDataSourcesSyncManager : SyncItemManagerBase, ISyncItemManager
    {
        private readonly SyncFormService _formService;
        private readonly ILogger<FormSyncManager> _logger;

        public FormDataSourcesSyncManager(SyncFormService formService, ILogger<FormSyncManager> logger)
        {
            _logger = logger;
            _formService = formService;
        }

        public override string[] EntityTypes => new string[]
        {
            UdiEntityType.FormsDataSource
        };

        public SyncLocalItem? GetEntity(SyncTreeItem treeItem)
        {
            if (treeItem.Id == Constants.System.RootString)
                return GetRootItem(treeItem);
            if (!Guid.TryParse(treeItem.Id, out Guid formKey)) return null;

            var form = _formService.GetDataSource(formKey);
            if (form == null) return null;

            return new SyncLocalItem
            {
                EntityType = EntityType,
                Id = treeItem.Id,
                Name = form.Name,
                Udi = Udi.Create(EntityType, form.Id)
            };
        }

        public override Task<IEnumerable<SyncItem>> GetItemsAsync(SyncItem item)
        {
            if (item.Udi.IsRoot)
            {
                var sources = _formService.GetAllDataSources();

                return uSyncTaskHelper.FromResultOf<IEnumerable<SyncItem>>(() =>
                {

                    return sources.Select(x => new SyncItem
                    {
                        Name = x.Name,
                        Udi = Udi.Create(UdiEntityType.FormsDataSource, x.Id),
                        Flags = item.Flags
                    });
                });
            }

            return uSyncTaskHelper.FromResultOf<IEnumerable<SyncItem>>(() =>
            {
                var items = new List<SyncItem>();

                if (item.Udi.EntityType == UdiEntityType.FormsDataSource)
                {
                    // we only add orginal item if its a form, we don't sync empty folders.
                    items.Add(item);
                }
                return items;
            });
        }

        public Task<SyncEntity?> GetSyncEntityAsync(string key)
        {
            if (Guid.TryParse(key, out var guidValue) is false)
                return Task.FromResult<SyncEntity?>(null);

            var dataSource = _formService.GetDataSource(guidValue);
            if (dataSource is null)
                return Task.FromResult<SyncEntity?>(null);

            return Task.FromResult<SyncEntity?>(new SyncEntity
            {
                Icon = "icon-star",
                Name = dataSource.Name,
                Udi = Udi.Create(UdiEntityType.FormsDataSource, guidValue)
            });

        }

        protected override Task<IEnumerable<SyncItem>> GetDescendantsAsync(SyncItem item, DependencyFlags flags)
            => uSyncTaskHelper.FromResultOf(() => GetDecendants(item, flags));
        
        protected IEnumerable<SyncItem> GetDecendants(SyncItem item, DependencyFlags flags)
        {
            if (item.Udi.IsRoot)
            {
                return _formService.GetAllForms().Select(x => new SyncItem
                {
                    Name = x.Name,
                    Udi = Udi.Create(UdiEntityType.FormsForm, x.Id),
                    Flags = flags & ~DependencyFlags.IncludeChildren
                });
            }
            else
            {
                switch(item.Udi.EntityType)
                {
                    case UdiEntityType.FormsPreValue:
                        return Enumerable.Empty<SyncItem>();
                    case uSyncForms.FolderEntityType:
                        if (item.Udi is GuidUdi guidUdi) {
                            var forms = _formService.GetFolderForms(guidUdi.Guid)
                                .Select(x => new SyncItem
                                {
                                    Name = x.Name,
                                    Udi = Udi.Create(UdiEntityType.FormsForm, x.Id),
                                    Flags = flags & ~DependencyFlags.IncludeChildren
                                });

                            _logger.LogDebug("Getting Forms in folder: {guid} {count}", guidUdi, forms.Count());

                            return forms;
                        }
                        break;
                }
            }

            return Enumerable.Empty<SyncItem>();
        }
    }
}
