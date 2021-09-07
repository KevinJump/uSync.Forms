using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Umbraco.Core;
using Umbraco.Core.Services;

using uSync.Forms.Services;

using uSync8.ContentEdition.Mapping;
using uSync8.Core.Dependency;

using static Umbraco.Core.Constants;

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
                        return new uSyncDependency
                        {
                            Name = form.Name,
                            Udi = Udi.Create(UdiEntityType.FormsForm, form.Id),
                            Flags = flags,
                            Order = uSyncFormPriorities.Forms
                        }.AsEnumerableOfOne();
                    }
                }
            }

            return Enumerable.Empty<uSyncDependency>();
        }
    }
}
