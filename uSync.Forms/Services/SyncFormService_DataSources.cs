using System;
using System.Collections.Generic;
using System.Linq;

using Umbraco.Extensions;
using Umbraco.Forms.Core;

namespace uSync.Forms.Services
{
    public partial class SyncFormService
    {
        public IEnumerable<FormDataSource> GetAllDataSources() => _dataSourceService.Get();

        public FormDataSource GetDataSource(Guid key)         
        { 
            try
            {
                return _dataSourceService.Get(key);
            }
            catch
            {
                return null;
            }
        }

        public FormDataSource GetDataSource(string name)
        {
            var sources = GetAllDataSources();
            if (sources != null)
                return sources.FirstOrDefault(x => x.Name.InvariantEquals(name));

            return default;
        }

        public void SaveDataSource(FormDataSource item)
        {
            _ = IsNew(item) ? _dataSourceService.Insert(item) : _dataSourceService.Update(item);
        }

        private bool IsNew(FormDataSource item)
            => item.Id == Guid.Empty || !GetAllDataSources().Any(x => x.Id == item.Id);

        public void DeleteDataSource(FormDataSource item) => _dataSourceService.Delete(item);
    }
}
    