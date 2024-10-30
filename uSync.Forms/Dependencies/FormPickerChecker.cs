using Azure;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

using System;
using System.Collections.Generic;
using Microsoft.Extensions.Options;
using System.Threading.Tasks;

using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models;
using Umbraco.Extensions;

using uSync.Core.Dependency;

namespace uSync.Forms.Dependencies;
public class FormPickerChecker : ISyncDependencyChecker<IContent>
{
    private readonly ILogger<FormPickerChecker> _logger;
    private uSyncFormsOptions _formsOptions;

    public FormPickerChecker(
        ILogger<FormPickerChecker> logger,
        IOptionsMonitor<uSyncFormsOptions> formsOptionsMonitor)
    {
        _logger = logger;
        _formsOptions = formsOptionsMonitor.CurrentValue;
        formsOptionsMonitor.OnChange(x =>
        {
            _formsOptions = x;
        });
    }

    public UmbracoObjectTypes ObjectType => UmbracoObjectTypes.Document;

    public IEnumerable<uSyncDependency> GetDependencies(IContent item, DependencyFlags flags)
    {
        if (item == null) return [];

        if (_formsOptions.DisableFormPush)
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

    public Task<IEnumerable<uSyncDependency>> GetDependenciesAsync(IContent item, DependencyFlags flags)
        => Task.FromResult(GetDependencies(item, flags));
}
