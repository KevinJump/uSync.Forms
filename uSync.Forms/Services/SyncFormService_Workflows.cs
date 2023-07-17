using System;
using System.Collections.Generic;
using System.Linq;

using Umbraco.Forms.Core;
using Umbraco.Forms.Core.Interfaces;
using Umbraco.Forms.Core.Models;

namespace uSync.Forms.Services
{
    public partial class SyncFormService
    {

        public void SaveWorkflow(Workflow workflow, Form form)
        {
            _ = IsNew(workflow, form) ? workflowService.Insert(workflow) : workflowService.Update(workflow);
        }

        /// <summary>
        ///  workflows json has the guid in it, so it new workflows might have empty guid values. 
        /// </summary>
        public bool IsNew(Workflow item, Form form)
            => (item.Id == Guid.Empty || (FindWorkflow(item.Id, form) == null));


        public Workflow FindWorkflow(Guid id, Form form)
        {
            var workflows = GetWorkflows(form);
            if (workflows == null) return null;
            return workflows.FirstOrDefault(x => x.Id == id);
        }

        public List<Workflow> GetWorkflows(Form form) => workflowService.Get(form);
    }
}
