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
        public FormSyncManager(SyncFormService formService)
        {
            _formService = formService;
        }


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

        protected override IEnumerable<SyncItem> GetDecendants(SyncItem item, DependencyFlags flags)
        {
            return Enumerable.Empty<SyncItem>();

            // for Umbraco.Forms v8.8 we will need to have this work when people pick folders 
            // but for now there are no children of a form.
        }
    }
}
