using Microsoft.AspNetCore.Cors.Infrastructure;

using System;
using System.Collections.Generic;
using System.Linq;

using Umbraco.Extensions;
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
        private readonly IPrevalueSourceService _preValueSourceService;

        private readonly IDataSourceService _dataSourceService;

        private readonly IFormService _formService;
        private readonly IFolderService _folderService;

        private readonly IWorkflowService _workflowService;

        public SyncFormService(
            IPrevalueSourceService preValueSourceService,
            IDataSourceService dataSourceService,
            IFormService formService,
            IFolderService folderService,
            IWorkflowService workflowService)
        {
            _preValueSourceService = preValueSourceService;

            _dataSourceService = dataSourceService;

            _formService = formService;
            _folderService = folderService;

            _workflowService = workflowService;
        }

        public IEnumerable<Form> GetAllForms() => _formService.Get();

        public Form? GetForm(Guid key)
        {
            try { return _formService.Get(key); }
            catch { return null; }
        }

        public Form? GetForm(string name) { 
            // the forms Get(name) throws when there isn't a form with that name (or there
            // are two), and we look forms up by name for every new form on an import.
            return GetAllForms().FirstOrDefault(x => x.Name.InvariantEquals(name));
        }

        public void SaveForm(Form item)
        {
            _ = IsNew(item) ? _formService.Insert(item) : _formService.Update(item);
        }

        private bool IsNew(Form item)
            => item.Id == Guid.Empty || !_formService.Exists(item.Id);


        public void DeleteForm(Form item)
        {
            _formService.Delete(item);
        }

    }
}
