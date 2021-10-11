using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;

using Umbraco.Cms.Core.Services;
using Umbraco.Extensions;

namespace uSync.Forms
{
    /// <summary>
    ///  old scool. id mapping just like we use to do in Umbraco 6
    /// </summary>
    public class FormsMapperHelper
    {
        private IEntityService _entityService;

        public FormsMapperHelper(IEntityService entityService)
        {
            _entityService = entityService;
        }

        private const string idRegEx = @"\d{4,9}";
        private const string guidRegEx = @"\b__[A-Fa-f0-9]{8}(?:-[A-Fa-f0-9]{4}){3}-[A-Fa-f0-9]{12}__\b";

        public string GetExportValue(string value)
        {
            if (!Regex.IsMatch(value, idRegEx)) return value;
            
            var replacements = new Dictionary<string, string>();

            foreach(Match m in Regex.Matches(value, idRegEx))
            {
                if (int.TryParse(m.Value, out int id))
                {
                    var entity = _entityService.Get(id);
                    if (entity != null)
                    {
                        replacements.Add(m.Value, $"__{entity.Key.ToString().ToLower()}__");
                    }
                }
            }

            return value.ReplaceMany(replacements);
        }

        public string GetImportValue(string value)
        {
            if (!Regex.IsMatch(value, guidRegEx)) return value;

            var replacements = new Dictionary<string, string>();
            foreach(Match m in Regex.Matches(value, guidRegEx))
            {
                var guidValue = value.Trim('_');
                if (Guid.TryParse(guidValue, out Guid guid))
                {
                    var entity = _entityService.Get(guid);
                    if (entity != null)
                    {
                        replacements.Add(m.Value, entity.Id.ToString());
                    }
                }
            }

            return value.ReplaceMany(replacements);

        }

    }
}
