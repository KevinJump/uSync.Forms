﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Xml.Linq;

using Microsoft.Extensions.Logging;

using Newtonsoft.Json;

using Umbraco.Forms.Core;
using Umbraco.Forms.Core.Providers;

using uSync.Core;
using uSync.Core.Models;
using uSync.Core.Serialization;
using uSync.Forms.Services;

namespace uSync.Forms.Serializers
{
    [SyncSerializer("A8A00EFF-795E-4D89-BA8F-7871FB9BD459", "PreValue", "PreValue", IsTwoPass = false)]
    public class PreValueSerializer : SyncSerializerRoot<FieldPreValueSource>, ISyncSerializer<FieldPreValueSource>
    {
        private FormsMapperHelper _mapperHelper;

        private SyncFormService SyncFormService;
        private FieldPreValueSourceCollection fieldPreValueSourceTypes;

        public PreValueSerializer(
            SyncFormService syncFormService,
            FormsMapperHelper formsMapperHelper,
            FieldPreValueSourceCollection fieldPreValueSourceTypes,
            ILogger<PreValueSerializer> logger) : base(logger)
        {
            this.fieldPreValueSourceTypes = fieldPreValueSourceTypes;
            this.SyncFormService = syncFormService;

            _mapperHelper = formsMapperHelper;
        }

        protected override SyncAttempt<XElement> SerializeCore(FieldPreValueSource item, SyncSerializerOptions options)
        {
            var node = new XElement(ItemType,
                new XAttribute("Key", ItemKey(item)),
                new XAttribute("Alias", ItemAlias(item)));


            var info = new XElement("Info");

            info.Add(new XElement ("Name", item.Name));
            info.Add(new XElement ("FieldPreValueSourceTypeId", item.FieldPreValueSourceTypeId));
            node.Add(info);

            var settingsJson = JsonConvert.SerializeObject(MapExportSettings(item.Settings), Formatting.Indented);
            node.Add(new XElement("Settings", settingsJson));

            return SyncAttempt<XElement>.Succeed(item.Name, node, ChangeType.Export, Array.Empty<uSyncChange>());
        }

        protected override SyncAttempt<FieldPreValueSource> DeserializeCore(XElement node, SyncSerializerOptions options)
        {

            var item = FindItem(node);

            if (item == null)
            {
                item = new FieldPreValueSource();
                item.Id = node.GetKey();
            }

            var info = node.Element("Info");
            if (info != null)
            {
                // validate that the prevalue source type exists (can be added in custom code)
                var fieldTypeId = info.Element("FieldPreValueSourceTypeId").ValueOrDefault(Guid.Empty);
                if (!fieldPreValueSourceTypes.Any(x => x.Id == fieldTypeId))
                {
                    return SyncAttempt<FieldPreValueSource>.Fail(node.GetAlias(), ChangeType.Fail,
                        "FieldType cannot be found (missing a PreValueProvider?)");
                }

                item.Name = info.Element("Name").ValueOrDefault(node.GetAlias());
                item.FieldPreValueSourceTypeId = fieldTypeId;
            }

            var settings = node.Element("Settings").ValueOrDefault(string.Empty);
            if (!string.IsNullOrWhiteSpace(settings)) {
                item.Settings = MapImportSettings(JsonConvert.DeserializeObject<Dictionary<string, string>>(settings));
            }
            
            return SyncAttempt<FieldPreValueSource>.Succeed(item.Name, item, ChangeType.Import, Array.Empty<uSyncChange>());
        }

        private Dictionary<string, string> MapExportSettings(Dictionary<string, string> settings)
        {
            // for export we copy the directory so we have no chance of 
            // accidently altering the form data. 
            var mapped = new Dictionary<string,string>(settings);
            foreach(var key in mapped.Keys.ToList())
            {
                mapped[key] = _mapperHelper.GetExportValue(mapped[key]);
            }

            return mapped;
        }

        private Dictionary<string, string> MapImportSettings(Dictionary<string, string> settings)
        {
            // for an import we created this directory from the xelement, we don't 
            // need to copy it. 
            foreach(var key in settings.Keys.ToList())
            {
                settings[key] = _mapperHelper.GetImportValue(settings[key]);
            }
            return settings;
        }

        public override FieldPreValueSource FindItem(int id) => null;

        public override void DeleteItem(FieldPreValueSource item)
            => SyncFormService.DeletePreValueSource(item);

        public override FieldPreValueSource FindItem(Guid key)
            => SyncFormService.GetPreValueSource(key);

        public override FieldPreValueSource FindItem(string alias)
            => SyncFormService.GetPreValueSource(alias);

        public override string ItemAlias(FieldPreValueSource item)
            => item.Name;

        public override Guid ItemKey(FieldPreValueSource item)
            => item.Id;

        public override void SaveItem(FieldPreValueSource item)
            => SyncFormService.SavePreValueSource(item);


        /// <summary>
        ///  we remove the key, because it can't be set in forms
        /// </summary>
        protected override XElement CleanseNode(XElement node)
        {
            var cleaned = XElement.Parse(node.ToString());
            cleaned.Attribute("Key").Value = Guid.Empty.ToString();
            return cleaned;
        }
    }
}
