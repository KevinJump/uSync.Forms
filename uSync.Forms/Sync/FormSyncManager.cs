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
    [SyncItemManager(UdiEntityType.FormsForm, Umbraco.Forms.Core.Constants.Trees.Form)]
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
            _logger.LogInformation("Tree Info {id} {section} {query} {alias} ", treeItem.Id, treeItem.SectionAlias, treeItem.QueryStrings, treeItem.TreeAlias);

            if (treeItem.Id == Constants.System.RootString)
                return GetRootItem(treeItem);

            

            if (treeItem.Id.StartsWith("folder-"))
            {
                // folder
                var folderId = treeItem.Id.Substring(7);

                _logger.LogInformation("FolderId : {folderId}", folderId);
                if (!Guid.TryParse(folderId, out Guid folderKey)) return null;

                _logger.LogInformation("FolderKey: {folderKey}", folderKey);
                var folder = _formService.GetFolder(folderKey);
                if (folder == null) return null;

                _logger.LogInformation("Found Folder: {name}", folder.Name);
                return new SyncLocalItem
                {
                    EntityType = EntityType,
                    Name = folder.Name,
                    Id = folder.Id.ToString(),
                    Udi = Udi.Create(uSyncForms.FolderEntityType, folder.Id)
                };
            }


            if (!Guid.TryParse(treeItem.Id, out Guid formKey)) return null;

            var form = _formService.GetForm(formKey);
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
                _logger.LogInformation("GetDecendants: {item}", item.Udi);

                switch(item.Udi.EntityType)
                {
                    case UdiEntityType.FormsForm:
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

                            _logger.LogInformation("Getting Forms in folder: {guid} {count}", guidUdi, forms.Count());

                            return forms;
                        }
                        break;
                }
            }

            return Enumerable.Empty<SyncItem>();
        }
    }
}
