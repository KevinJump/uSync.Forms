using System;
using System.Collections.Generic;
using System.Linq;

using Umbraco.Core;
using Umbraco.Extensions;
using Umbraco.Forms.Core;
using Umbraco.Forms.Core.Interfaces;

namespace uSync.Forms.Services
{
    /// <summary>
    ///  a service that just abstracts away the forms service/storage stuff.
    /// </summary>
    public partial class SyncFormService
    {

        public IEnumerable<IFieldPreValueSource> GetAllPreValues() => prevalueSourceService.Get();

        public FieldPreValueSource GetPreValueSource(Guid id) => (FieldPreValueSource)prevalueSourceService.Get(id);

        public FieldPreValueSource GetPreValueSource(string name)
        {
            var preValues = GetAllPreValues();
            if (preValues != null)
                return (FieldPreValueSource)preValues.FirstOrDefault(x => x.Name.InvariantEquals(name));

            return default;
        }

        public void SavePreValueSource(FieldPreValueSource item)
        {
            _ = IsNew(item) ? prevalueSourceService.Insert(item) : prevalueSourceService.Update(item);
        }

        private bool IsNew(FieldPreValueSource item)
        {
            return item.Id == Guid.Empty || GetAllPreValues().FirstOrDefault(x => x.Id == item.Id) == null;
        }

        public void DeletePreValueSource(FieldPreValueSource item) => prevalueSourceService.Delete(item);
    }
}
