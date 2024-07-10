using Azure;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

using System;
using System.Collections.Generic;

using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models;
using Umbraco.Extensions;

using uSync.Core.Dependency;

namespace uSync.Forms.Dependencies;
public class FormPickerChecker : ISyncDependencyChecker<IContent>
{
    private readonly ILogger<FormPickerChecker> _logger;
    private readonly IConfigurationManager _configurationManager;

    public FormPickerChecker(
        ILogger<FormPickerChecker> logger,
        IConfigurationManager configurationManager = null)
    {
        _logger = logger;
        _configurationManager = configurationManager;
    }

    public UmbracoObjectTypes ObjectType => UmbracoObjectTypes.Document;

    public IEnumerable<uSyncDependency> GetDependencies(IContent item, DependencyFlags flags)
    {
        if (item == null) return [];

        if (_configurationManager.GetValue("uSync:Forms:DisableFormPush", false))
        {
            _logger.LogDebug("Form push is disabled via configuration.");
            return [];
        }

        var items = new List<uSyncDependency>();

        foreach (var property in item.Properties)
        {
            if (property.PropertyType.PropertyEditorAlias.InvariantEquals("UmbracoForms.FormPicker") is false)
                continue;

            var formId = property.GetValue();
            if (formId != null && Guid.TryParse(formId.ToString(), out Guid formKey))
            {
                items.Add(new uSyncDependency
                {
                    Flags = flags,
                    Level = 100,
                    Mode = DependencyMode.MustExist,
                    Name = $"Form Picker: {formId}",
                    Order = 1,
                    Udi = Udi.Create(Constants.UdiEntityType.FormsForm, formKey)
                });
            }
        }

        return items;
    }
}
