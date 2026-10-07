using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;

using Umbraco.Cms.Core.Services;
using Umbraco.Extensions;

namespace uSync.Forms
{
    /// <summary>
    ///  old school. id mapping just like we use to do in Umbraco 6
    /// </summary>
    public partial class FormsMapperHelper
    {
        private readonly IEntityService _entityService;

        public FormsMapperHelper(IEntityService entityService)
        {
            _entityService = entityService;
        }

        // lookarounds stop us matching runs of digits inside guids or longer tokens.
        private const string _idRegEx = @"(?<![\w-])\d{4,9}(?![\w-])";
        private const string _guidRegEx = @"\b__[A-Fa-f0-9]{8}(?:-[A-Fa-f0-9]{4}){3}-[A-Fa-f0-9]{12}__\b";

		[GeneratedRegex(_idRegEx)]
		private static partial Regex IdRegEx();

		[GeneratedRegex(_guidRegEx)]
		private static partial Regex GuidRegEx();


		public string GetExportValue(string value)
        {
            var replacements = new Dictionary<string, string>();

            foreach(Match m in IdRegEx().Matches(value).Cast<Match>())
            {
                if (replacements.ContainsKey(m.Value)) continue;

                if (int.TryParse(m.Value, out int id))
                {
                    var entity = _entityService.Get(id);
                    if (entity != null)
                    {
                        replacements[m.Value] = $"__{entity.Key.ToString().ToLower()}__";
                    }
                }
            }

            return replacements.Count == 0 ? value : value.ReplaceMany(replacements);
        }

        public string GetImportValue(string value)
        {
            var replacements = new Dictionary<string, string>();
            
            foreach(Match m in GuidRegEx().Matches(value).Cast<Match>())
            {
                if (replacements.ContainsKey(m.Value)) continue;

                var guidValue = m.Value.Trim('_');
                if (Guid.TryParse(guidValue, out Guid guid))
                {
                    var entity = _entityService.Get(guid);
                    if (entity != null)
                    {
                        replacements[m.Value] = entity.Id.ToString();
                    }
                }
            }

            return replacements.Count == 0 ? value : value.ReplaceMany(replacements);
        }
	}
}
