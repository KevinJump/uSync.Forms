using Microsoft.Extensions.Logging;

using System;
using System.Collections.Generic;
using System.Linq;

using Umbraco.Cms.Core;

using uSync.Core.Dependency;
using uSync.Core.Sync;
using uSync.Forms.Services;

using static Umbraco.Cms.Core.Constants;

namespace uSync.Forms.Sync
{
    /// <summary>
    ///  form Sync manager, tells uSync.Complete how to render the push/pull menus.
    /// </summary>
    [SyncItemManager(UdiEntityType.FormsDataSource, Umbraco.Forms.Core.Constants.Trees.DataSource)]
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


        /////////////////        
        // Forms doesn't use the EditorService to open its picker (because why would it)
        // but if it did then we could do this, and then forms would also appear in 
        // uSyncExporter so they could be included in export sync packs. 

        //public override SyncEntityInfo GetSyncInfo(string entityType)
        //{
        //    return new SyncEntityInfo
        //    {
        //        SectionAlias = Constants.Applications.Forms,
        //        TreeAlias = Umbraco.Forms.Core.Constants.Trees.Form,
        //        PickerView = "/App_Plugins/UmbracoForms/Backoffice/Form/overlays/formpicker/formpicker.html"
        //    };
        //}

        public SyncLocalItem GetEntity(SyncTreeItem treeItem)
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

        public override IEnumerable<SyncItem> GetItems(SyncItem item)
        {
            var items = new List<SyncItem>();

            if (item.Udi.EntityType == UdiEntityType.FormsDataSource)
            {
                // we only add orginal item if its a form, we don't sync empty folders.
                items.Add(item);
            }
            return items;            
        }

        protected override IEnumerable<SyncItem> GetDecendants(SyncItem item, DependencyFlags flags)
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
