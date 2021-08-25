using System;
using System.Collections.Generic;
using System.Linq;

using Umbraco.Core;
using Umbraco.Forms.Core;
using Umbraco.Forms.Core.Interfaces;

namespace uSync.Forms.Services
{
    /// <summary>
    ///  a service that just abstracts away the forms service/storage stuff.
    /// </summary>
    public partial class SyncFormService
    {

        public IEnumerable<IFieldPreValueSource> GetAllPreValues()
        {
            if (Configuration.StoreUmbracoFormsInDb)
            {
                return prevalueSourceService.Get();
            }
            else
            {
                return prevalueSourceStorage.GetAllPrevalueSources();
            }
        }

        public FieldPreValueSource GetPreValueSource(Guid id)
        {
            try
            {
                if (Configuration.StoreUmbracoFormsInDb)
                    return (FieldPreValueSource)prevalueSourceService.Get(id);
                else
                    return (FieldPreValueSource)prevalueSourceStorage.GetPrevalueSource(id);
            }
            catch(Exception ex)
            {
                return null;
            }
        }

        public FieldPreValueSource GetPreValueSource(string name)
        {
            var preValues = GetAllPreValues();
            if (preValues != null)
                return (FieldPreValueSource)preValues.FirstOrDefault(x => x.Name.InvariantEquals(name));

            return default;
        }

        public void SavePreValueSource(FieldPreValueSource item)
        {
            if (Configuration.StoreUmbracoFormsInDb)
            {
                _ = IsNew(item) ? prevalueSourceService.Insert(item) : prevalueSourceService.Update(item);
            }
            else
            {
                _ = IsNew(item) ? prevalueSourceStorage.InsertPrevalueSource(item) : prevalueSourceStorage.UpdatePreValueSource(item);
            }
        }

        private bool IsNew(FieldPreValueSource item)
        {
            return item.Id == Guid.Empty || GetAllPreValues().FirstOrDefault(x => x.Id == item.Id) == null;
        }

        public void DeletePreValueSource(FieldPreValueSource item)
        {
            if (Configuration.StoreUmbracoFormsInDb)
            {
                prevalueSourceService.Delete(item);
            }
            else
            {
                prevalueSourceStorage.DeletePrevalueSource(item);
            }
        }

    }
}
