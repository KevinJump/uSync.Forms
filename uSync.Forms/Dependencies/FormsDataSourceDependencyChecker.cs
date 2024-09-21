using System;
using System.Collections.Generic;
using System.Linq;

using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models;
using Umbraco.Extensions;
using Umbraco.Forms.Core;
using Umbraco.Forms.Core.Models;

using uSync.Core.Dependency;

using static Umbraco.Cms.Core.Constants;
using Constants = Umbraco.Cms.Core.Constants;

namespace uSync.Forms.Dependencies
{
    public class FormsDataSourceDependencyChecker : ISyncDependencyChecker<FormDataSource>
    {
        public UmbracoObjectTypes ObjectType => UmbracoObjectTypes.FormsDataSource;

        public IEnumerable<uSyncDependency> GetDependencies(FormDataSource item, DependencyFlags flags)
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
                    Udi = Udi.Create(Constants.UdiEntityType.FormsDataSource, item.Id)
                }
            };
            return items;
        }

        
    }
}