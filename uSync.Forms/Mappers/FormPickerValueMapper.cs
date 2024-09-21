using System;
using System.Collections.Generic;
using System.Linq;

using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Services;
using Umbraco.Extensions;

using uSync.Core.Dependency;
using uSync.Core.Mapping;
using uSync.Forms.Services;

using static Umbraco.Cms.Core.Constants;

namespace uSync.Forms.Mappers
{
    public class FormPickerValueMapper : SyncValueMapperBase, ISyncMapper
    {
        private SyncFormService _syncFormService;
        public FormPickerValueMapper(
            SyncFormService syncFormService,
            IEntityService entityService) : base(entityService)
        {
            _syncFormService = syncFormService;
        }

        public override string Name => "Forms Picker Mapper";

        public override string[] Editors => new string[]
        {
            "UmbracoForms.FormPicker"
        };

        public override IEnumerable<uSyncDependency> GetDependencies(object value, string editorAlias, DependencyFlags flags)
        {
            if (value != null)
            {
                var attempt = value.TryConvertTo<Guid>();
                if (attempt.Success)
                {
                    var form = _syncFormService.GetForm(attempt.Result);

                    if (form != null)
                    {
                        var formDependency = new uSyncDependency
                        {
                            Name = form.Name,
                            Udi = Udi.Create(UdiEntityType.FormsForm, form.Id),
                            Flags = flags,
                            Order = uSyncFormPriorities.Forms,
                        }.AsEnumerableOfOne().ToList();
                        if (form.DataSource == null)
                        {
                            return formDependency;
                        }
                        formDependency.Add(new uSyncDependency
                        {
                            Udi = Udi.Create(UdiEntityType.FormsDataSource, form.DataSource.Id),
                            Flags = flags,
                            Order = uSyncFormPriorities.DataSources,
                        });
                    }
                }
            }

            return Enumerable.Empty<uSyncDependency>();
        }
    }
}
