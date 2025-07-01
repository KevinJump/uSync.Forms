using Microsoft.Extensions.Logging;

using NPoco.RowMappers;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Metadata.Ecma335;
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
    [SyncItemManager(UdiEntityType.FormsForm, "")]
    public class FormSyncManager : SyncItemManagerBase, ISyncItemManager
    {
        private readonly SyncFormService _formService;
        private readonly ILogger<FormSyncManager> _logger;

        public FormSyncManager(SyncFormService formService, ILogger<FormSyncManager> logger)
        {
            _logger = logger;
            _formService = formService;
        }

        public override string[] EntityTypes => new string[]
        {
            UdiEntityType.FormsForm,
            uSyncForms.FolderEntityType
        };


        public Task<SyncEntity?> GetSyncEntityAsync(string key)
        {
            if (Guid.TryParse(key, out var guidKey) is false)
                return Task.FromResult<SyncEntity?>(null);

            var item = _formService.GetForm(guidKey);
            if (item is not null)
            {
                return Task.FromResult<SyncEntity?>(new SyncEntity
                {
                    Icon = "icon-form",
                    Name = item.Name,
                    Udi = Udi.Create(UdiEntityType.FormsForm, item.Id)
                });
            }

            var folder = _formService.GetFolder(guidKey);
            if (folder is not null)
            {
                return Task.FromResult<SyncEntity?>(new SyncEntity
                {
                    Icon = "icon-form",
                    Name = folder.Name,
                    Udi = Udi.Create(uSyncForms.FolderEntityType, folder.Id)
                });
            }

            return Task.FromResult<SyncEntity?>(null);

        }

        public override Task<IEnumerable<SyncItem>> GetItemsAsync(SyncItem item)
            => uSyncTaskHelper.FromResultOf(() => GetItems(item));

        private IEnumerable<SyncItem> GetItems(SyncItem item)
        {
            var items = new List<SyncItem>();

            if (item.Udi.EntityType == UdiEntityType.FormsForm)
            {
                // we only add orginal item if its a form, we don't sync empty folders.
                items.Add(item);
            }

            if (item.Flags.HasFlag(DependencyFlags.IncludeChildren))
            {
                items.AddRange(GetDecendants(item, item.Flags & ~DependencyFlags.IncludeChildren));
            }

            return items;
        }

        protected override Task<IEnumerable<SyncItem>> GetDescendantsAsync(SyncItem item, DependencyFlags flags)
            => uSyncTaskHelper.FromResultOf(() => GetDecendants(item, flags));

        private IEnumerable<SyncItem> GetDecendants(SyncItem item, DependencyFlags flags)
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
                switch (item.Udi.EntityType)
                {
                    case UdiEntityType.FormsForm:
                        return Enumerable.Empty<SyncItem>();
                    case uSyncForms.FolderEntityType:
                        if (item.Udi is GuidUdi guidUdi)
                        {
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
