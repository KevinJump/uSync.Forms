using System;
using System.Collections.Generic;
using System.Linq;

using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models;
using Umbraco.Extensions;
using Umbraco.Forms.Core.Models;

using uSync.Core.Dependency;

using static Umbraco.Cms.Core.Constants;

namespace uSync.Forms.Dependencies
{
    public class FormDependencyChecker : ISyncDependencyChecker<Form>
    {
        public UmbracoObjectTypes ObjectType => UmbracoObjectTypes.FormsForm;

        public IEnumerable<uSyncDependency> GetDependencies(Form item, DependencyFlags flags)
        {
            if (item == null) return Enumerable.Empty<uSyncDependency>();

            var items = new List<uSyncDependency>
            {
                new uSyncDependency
                {
                    Flags = flags,
                    Level = 100,
                    Mode = DependencyMode.MustExist,
                    Name = item.Name,
                    Order = 1,
                    Udi = Udi.Create(Constants.UdiEntityType.FormsForm, item.Id)
                }
            };

            if (flags.HasFlag(DependencyFlags.IncludeDependencies))
            {
                var dependentFlags = DependencyFlags.IncludeDependencies;

                items.AddRange(GetPreValues(item, dependentFlags));
                items.AddRange(GetDataSources(item,dependentFlags));
            }

            return items;
        }

        private IEnumerable<uSyncDependency> GetPreValues(Form item, DependencyFlags flags)
        {
            var items = new List<uSyncDependency>();
            foreach(var field in item.AllFields)
            {

                if (field.PreValueSourceId != Guid.Empty)
                {
                    items.Add(new uSyncDependency
                    {
                        Mode = DependencyMode.MustExist,
                        Flags = flags,
                        Level = 0,
                        Name = field.PreValueSourceId.ToString(),
                        Udi = Udi.Create(UdiEntityType.FormsPreValue, field.PreValueSourceId)
                    });
                }
            }

            return items;
        }

        private IEnumerable<uSyncDependency> GetDataSources(Form item, DependencyFlags flags)
        {
            if (item.DataSource == null) return Enumerable.Empty<uSyncDependency>();

            return new uSyncDependency
            {
                Flags = flags,
                Level = 1,
                Name = item.DataSource.Id.ToString(),
                Udi = Udi.Create(UdiEntityType.FormsDataSource, item.DataSource.Id)
            }.AsEnumerableOfOne();
        }
    }
}
