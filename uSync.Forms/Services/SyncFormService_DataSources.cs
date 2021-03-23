using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Umbraco.Core;
using Umbraco.Forms.Core;

namespace uSync.Forms.Services
{
    public partial class SyncFormService
    {
        public IEnumerable<FormDataSource> GetAllDataSources()
            => Configuration.StoreUmbracoFormsInDb
                ? dataSourceService.Get()
                : dataSourceStorage.GetAllDataSources();

        public FormDataSource GetDataSource(Guid key)
        {
            try
            {
                return Configuration.StoreUmbracoFormsInDb
                ? dataSourceService.Get(key)
                : dataSourceStorage.GetDataSource(key);
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
            if (Configuration.StoreUmbracoFormsInDb)
            {
                _ = IsNew(item) ? dataSourceService.Insert(item) : dataSourceService.Update(item);
            }
            else
            {
                _ = IsNew(item) ? dataSourceStorage.InsertDataSource(item) : dataSourceStorage.UpdateDataSource(item);
            }
        }

        private bool IsNew(FormDataSource item)
            => item.Id == Guid.Empty || !GetAllDataSources().Any(x => x.Id == item.Id);

        public void DeleteDataSource(FormDataSource item)
        {
            if (Configuration.StoreUmbracoFormsInDb)
            {
                dataSourceService.Delete(item);
            }
            else
            {
                dataSourceStorage.DeleteDataSource(item);
            }
        }
    }
}
