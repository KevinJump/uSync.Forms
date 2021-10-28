using Microsoft.AspNetCore.Cors.Infrastructure;

using System;
using System.Collections.Generic;
using System.Linq;

using Umbraco.Forms.Core.Models;
using Umbraco.Forms.Core.Services;

namespace uSync.Forms.Services
{
    /// <summary>
    ///  SyncForm Service - abstracts aways the whole are we storing in the DB or on disk
    ///  makes the handlers/serializers neater.
    /// </summary>
    public partial class SyncFormService
    {
        private readonly IPrevalueSourceService prevalueSourceService;

        private readonly IDataSourceService dataSourceService;

        private readonly IFormService formService;
        private readonly IFolderService folderService;

        private readonly IWorkflowService workflowService;

        public SyncFormService(
            IPrevalueSourceService prevalueSourceService,
            IDataSourceService dataSourceService,
            IFormService formService,
            IFolderService folderService,
            IWorkflowService workflowService)
        {
            this.prevalueSourceService = prevalueSourceService;

            this.dataSourceService = dataSourceService;

            this.formService = formService;
            this.folderService = folderService;

            this.workflowService = workflowService;
        }

        public IEnumerable<Form> GetAllForms() => formService.Get();

        public Form GetForm(Guid key)
        {
            try { return formService.Get(key); }
            catch { return null; }
        }

        public Form GetForm(string name) { 
            try { return formService.Get(name); }
            catch { return null; }
        }

        public void SaveForm(Form item)
        {
            _ = IsNew(item) ? formService.Insert(item) : formService.Update(item);
        }

        private bool IsNew(Form item)
            => item.Id == Guid.Empty || !GetAllForms().Any(x => x.Id == item.Id);


        public void DeleteForm(Form item)
        {
            formService.Delete(item);
        }

    }
}
