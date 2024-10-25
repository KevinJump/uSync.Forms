using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Xml.Linq;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Umbraco.Forms.Core;
using Umbraco.Forms.Core.Data;
using Umbraco.Forms.Core.Models;
using Umbraco.Forms.Core.Providers;
using Umbraco.Forms.Core.Services;
using uSync.Core;
using uSync.Core.Extensions;
using uSync.Core.Models;
using uSync.Core.Serialization;
using uSync.Forms.Services;

namespace uSync.Forms.Serializers
{
    [SyncSerializer("A8A00EFF-795E-4D89-BA8F-7871FB9BD459", "PreValue", "PreValue", IsTwoPass = false)]
    public class PreValueSerializer : SyncSerializerRoot<FieldPreValueSource>, ISyncSerializer<FieldPreValueSource>
    {
        private readonly FormsMapperHelper _mapperHelper;

        private readonly SyncFormService _syncFormService;
        private readonly FieldPreValueSourceCollection _fieldPreValueSourceTypes;
        private readonly IPreValueTextFileStorage _preValueTextFileStorage;

        public PreValueSerializer(
            SyncFormService syncFormService,
            FormsMapperHelper formsMapperHelper,
            FieldPreValueSourceCollection fieldPreValueSourceTypes,
            IPreValueTextFileStorage preValueTextFileStorage,
            ILogger<PreValueSerializer> logger) : base(logger)
        {
            _fieldPreValueSourceTypes = fieldPreValueSourceTypes;
            _preValueTextFileStorage = preValueTextFileStorage;
            _syncFormService = syncFormService;
            _mapperHelper = formsMapperHelper;
        }


        protected override Task<SyncAttempt<XElement>> SerializeCoreAsync(FieldPreValueSource item, SyncSerializerOptions options)
        {
            return uSyncTaskHelper.FromResultOf(() =>
            {

                var node = new XElement(ItemType,
                    new XAttribute("Key", ItemKey(item)),
                    new XAttribute("Alias", ItemAlias(item)));


                var info = new XElement("Info",
                    new XElement("Name", item.Name),
                    new XElement("FieldPreValueSourceTypeId", item.FieldPreValueSourceTypeId));

                node.Add(info);

                var settingsJson = JsonConvert.SerializeObject(MapExportSettings(item.Settings), Formatting.Indented);
                node.Add(new XElement("Settings", settingsJson));
                if (item.Settings.ContainsKey("TextFile") && options.GetSetting("IncludeFileContent", true))
                {
                    node.Add(new XElement("TextFile", SerializeFileContent(item.Settings["TextFile"])));
                }

                return SyncAttempt<XElement>.Succeed(item.Name, node, ChangeType.Export, []);
            });
        }

        private XElement SerializeFileContent(string item)
        {
            try
            {
                if (!string.IsNullOrWhiteSpace(item))
                {
                    return new XElement("FileContent",
                        JsonConvert.SerializeObject(_preValueTextFileStorage.GetTextFilePreValues(item)));
                }
            }
            catch (Exception ex)
            {
                // can happen when the media locations get moved.
                logger.LogError(ex, "Error reading prevalueSource file: {item}", item);
            }

            return new XElement("FileContent", "");
        }

        protected override async Task<SyncAttempt<FieldPreValueSource>> DeserializeCoreAsync(XElement node, SyncSerializerOptions options)
        {
            var item = await FindItemAsync(node) ?? new FieldPreValueSource { Id = node.GetKey() };

            var info = node.Element("Info");
            if (info != null)
            {
                // validate that the PreValue source type exists (can be added in custom code)
                var fieldTypeId = info.Element("FieldPreValueSourceTypeId").ValueOrDefault(Guid.Empty);
                if (!_fieldPreValueSourceTypes.Any(x => x.Id == fieldTypeId))
                {
                    return SyncAttempt<FieldPreValueSource>.Fail(node.GetAlias(), ChangeType.Fail,
                        "FieldType cannot be found (missing a PreValueProvider?)");
                }

                item.Name = info.Element("Name").ValueOrDefault(node.GetAlias());
                item.FieldPreValueSourceTypeId = fieldTypeId;
            }

            var settings = node.Element("Settings").ValueOrDefault(string.Empty);
            if (!string.IsNullOrWhiteSpace(settings))
            {
                item.Settings = MapImportSettings(JsonConvert.DeserializeObject<Dictionary<string, string>>(settings) ?? []);
            }
            var textFile = node.Element("TextFile");
            if (textFile != null)
            {
                var textFileContent = textFile.Element("FileContent").ValueOrDefault(string.Empty);
                if (!string.IsNullOrWhiteSpace(textFileContent))
                {
                    var preValues = JsonConvert.DeserializeObject<List<PreValue>>(textFileContent);
                    var textFileName = item.Settings["TextFile"];
                    _preValueTextFileStorage.SaveValuesIntoFile((preValues?.Select(x=>$"{x.Value}|{x.Caption}") ?? []).ToList(),textFileName);
                }
            }

            return SyncAttempt<FieldPreValueSource>.Succeed(item.Name, item, ChangeType.Import, []);
        }

        private Dictionary<string, string> MapExportSettings(Dictionary<string, string> settings)
        {
            // for export we copy the directory so we have no chance of 
            // accidently altering the form data. 
            var mapped = new Dictionary<string, string>(settings);
            foreach (var key in mapped.Keys.ToList())
            {
                mapped[key] = _mapperHelper.GetExportValue(mapped[key]);
            }

            return mapped;
        }

        private Dictionary<string, string> MapImportSettings(Dictionary<string, string> settings)
        {
            // for an import we created this directory from the XElement, we don't 
            // need to copy it. 
            foreach (var key in settings.Keys.ToList())
            {
                settings[key] = _mapperHelper.GetImportValue(settings[key]);
            }

            return settings;
        }

        public override Task DeleteItemAsync(FieldPreValueSource item)
            => uSyncTaskHelper.FromResultOf(() => _syncFormService.DeletePreValueSource(item));

        public override Task<FieldPreValueSource?> FindItemAsync(Guid key)
            => uSyncTaskHelper.FromResultOf<FieldPreValueSource?>(() => _syncFormService.GetPreValueSource(key));

        public override Task<FieldPreValueSource?> FindItemAsync(string alias)
            => uSyncTaskHelper.FromResultOf<FieldPreValueSource?>(() => _syncFormService.GetPreValueSource(alias));

        public override string ItemAlias(FieldPreValueSource item)
            => item.Name;

        public override Guid ItemKey(FieldPreValueSource item)
            => item.Id;

        public override Task SaveItemAsync(FieldPreValueSource item)
            => uSyncTaskHelper.FromResultOf(() => _syncFormService.SavePreValueSource(item));

        /// <summary>
        ///  we remove the key, because it can't be set in forms
        /// </summary>
        protected override XElement CleanseNode(XElement node)
        {
            var cleansed = XElement.Parse(node.ToString());

            var keyNode = cleansed.Attribute("key");
            if (keyNode != null)
                keyNode.Value = Guid.Empty.ToString();
            return cleansed;
        }

    }
}