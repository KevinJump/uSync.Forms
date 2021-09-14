using System;
using System.Collections.Generic;
using System.Linq;

using Umbraco.Core;
using Umbraco.Core.Composing;
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

        private IFolderService folderService;
        private bool _hasFolders; 

        public SyncFormService(
            IPrevalueSourceService prevalueSourceService,
            IPrevalueSourceStorage prevalueSourceStorage,
            IDataSourceService dataSourceService,
            IDataSourceStorage dataSourceStorage,
            IFormService formService,
            IFormStorage formStorage,
            IWorkflowServices workflowServices,
            IWorkflowStorage workflowStorage,
            IFactory factory)
        {
            this.prevalueSourceStorage = prevalueSourceStorage;
            this.prevalueSourceService = prevalueSourceService;

            this.dataSourceService = dataSourceService;
            this.dataSourceStorage = dataSourceStorage;

            this.formService = formService;
            this.formStorage = formStorage;

            this.workflowServices = workflowServices;
            this.workflowStorage = workflowStorage;

            LoadFolderService(factory);
        }

        public bool FormsInDb => Configuration.StoreUmbracoFormsInDb;

        private void LoadFolderService(IFactory factory)
        {
            try
            {
                this.folderService = factory.GetInstance<IFolderService>();
                this._hasFolders = true;
            }
            catch
            {
                this._hasFolders = false;
            }
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
                    return formStorage.GetAll().FirstOrDefault(x => x.Name == name);
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
                _ = IsNew(item) ? formService.Insert(item) : formService.Update(item);
            }
            else
            {
                _ = IsNew(item) ? formStorage.InsertForm(item) : formStorage.UpdateForm(item);
            }
        }

        private bool IsNew(Form item)
            => item.Id == Guid.Empty || !GetAllForms().Any(x => x.Id == item.Id);


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
