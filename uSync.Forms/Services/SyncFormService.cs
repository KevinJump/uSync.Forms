using System;
using System.Collections.Generic;

using Umbraco.Forms.Core;
using Umbraco.Forms.Core.Data.Storage;
using Umbraco.Forms.Core.Models;
using Umbraco.Forms.Core.Services;
using Umbraco.Forms.Data.Storage;

namespace uSync.Forms.Services
{
    /// <summary>
    ///  SyncForm Service - abstracts aways the whole are we storing in the DB or on disk
    ///  makes the handlers/serializers neater.
    /// </summary>
    public partial class SyncFormService
    {
        private readonly IPrevalueSourceService prevalueSourceService;
        private readonly IPrevalueSourceStorage prevalueSourceStorage;

        private readonly IDataSourceService dataSourceService;
        private readonly IDataSourceStorage dataSourceStorage;

        private readonly IFormService formService;
        private readonly IFormStorage formStorage;

        private readonly IWorkflowServices workflowServices;
        private readonly IWorkflowStorage workflowStorage;

        public SyncFormService(
            IPrevalueSourceService prevalueSourceService,
            IPrevalueSourceStorage prevalueSourceStorage,
            IDataSourceService dataSourceService,
            IDataSourceStorage dataSourceStorage,
            IFormService formService,
            IFormStorage formStorage,
            IWorkflowServices workflowServices,
            IWorkflowStorage workflowStorage)
        {
            this.prevalueSourceStorage = prevalueSourceStorage;
            this.prevalueSourceService = prevalueSourceService;

            this.dataSourceService = dataSourceService;
            this.dataSourceStorage = dataSourceStorage;

            this.formService = formService;
            this.formStorage = formStorage;

            this.workflowServices = workflowServices;
            this.workflowStorage = workflowStorage;
        }

        public IEnumerable<Form> GetAllForms()
        {
            if (Configuration.StoreUmbracoFormsInDb)
            {
                return formService.Get();
            }
            else
            {
                return formStorage.GetAllForms();
            }
        }

        public Form GetForm(Guid key)
        {
            try
            {
                if (Configuration.StoreUmbracoFormsInDb)
                {
                    return formService.Get(key);
                }
                else
                {
                    return formStorage.GetForm(key);
                }
            }
            catch
            {
                return null;
            }
        }

        public Form GetForm(string name)
        {
            try
            {
                if (Configuration.StoreUmbracoFormsInDb)
                {
                    return formService.Get(name);
                }
                else
                {
                    return formStorage.GetForm(name);
                }
            }
            catch
            {
                return null;
            }
        }

        public void SaveForm(Form item)
        {
            if (Configuration.StoreUmbracoFormsInDb)
            {
                _ = item.Id == Guid.Empty ? formService.Insert(item) : formService.Update(item);
            }
            else
            {
                _ = item.Id == Guid.Empty ? formStorage.InsertForm(item) : formStorage.UpdateForm(item);
            }
        }

        public void DeleteForm(Form item)
        {
            if (Configuration.StoreUmbracoFormsInDb)
            {
                formService.Delete(item);
            }
            else
            {
                formStorage.DeleteForm(item);
            }
        }

    }
}
