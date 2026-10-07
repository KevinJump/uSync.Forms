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
    [SyncItemManager(UdiEntityType.FormsPreValue, "")]
    public class FormPreValuesSyncManager : SyncItemManagerBase, ISyncItemManager
    {
        private readonly SyncFormService _formService;

        public FormPreValuesSyncManager(SyncFormService formService)
        {
            _formService = formService;
        }

        public override string[] EntityTypes => new string[]
        {
            UdiEntityType.FormsPreValue
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

        public override Task<IEnumerable<SyncItem>> GetItemsAsync(SyncItem item)
        {
            if (item.Udi.IsRoot)
            {
                var preValues = _formService.GetAllPreValues();

                // if this is the root item, we return all forms
                return uSyncTaskHelper.FromResultOf<IEnumerable<SyncItem>>(() =>
                {
                    return preValues.Select(x => new SyncItem
                    {
                        Name = x.Name,
                        Udi = Udi.Create(UdiEntityType.FormsPreValue, x.Id),
                        Flags = item.Flags 
                    });
                });
            }

            return uSyncTaskHelper.FromResultOf<IEnumerable<SyncItem>>(() =>
            {
                var items = new List<SyncItem>();

                if (item.Udi.EntityType == UdiEntityType.FormsPreValue)
                {
                    // we only add original item if its a form, we don't sync empty folders.
                    items.Add(item);
                }
                return items;
            });
        }

        public Task<SyncEntity?> GetSyncEntityAsync(string key)
        {
            if (Guid.TryParse(key, out var guidValue) is false)
                return Task.FromResult<SyncEntity?>(null);

            var preValue = _formService.GetPreValueSource(guidValue);
            if (preValue is null)
                return Task.FromResult<SyncEntity?>(null);

            return Task.FromResult<SyncEntity?>(new SyncEntity
            {
                Icon = "icon-star",
                Name = preValue.Name,
                Udi = Udi.Create(UdiEntityType.FormsPreValue, guidValue)
            });
        }

        /// <summary>
        ///  prevalue sources do not have children (the root is handled in GetItemsAsync).
        /// </summary>
        protected override Task<IEnumerable<SyncItem>> GetDescendantsAsync(SyncItem item, DependencyFlags flags)
            => Task.FromResult(Enumerable.Empty<SyncItem>());
    }
}
