using System;
using System.Collections.Generic;
using System.Xml.Linq;

using Newtonsoft.Json;

using Umbraco.Cms.Core;
using Umbraco.Forms.Core;

using uSync.Forms.Services;

using uSync.Core;
using uSync.Core.Models;
using uSync.Core.Serialization;
using Microsoft.Extensions.Logging;

namespace uSync.Forms.Serializers
{
    [SyncSerializer("880817EB-BE5C-4540-ABDE-82010846F039", "DataSource", "DataSource", IsTwoPass = false)]
    public class DataSourceSerializer : SyncSerializerRoot<FormDataSource>, ISyncSerializer<FormDataSource>
    {
        private SyncFormService syncFormService;

        public DataSourceSerializer(ILogger<SyncSerializerRoot<FormDataSource>> logger, SyncFormService syncFormService) : base(logger)
        {
            this.syncFormService = syncFormService;
        }

        protected override SyncAttempt<XElement> SerializeCore(FormDataSource item, SyncSerializerOptions options)
        {
            var node = this.InitializeBaseNode(item, item.Name);

            var info = new XElement("Info");

            info.Add(new XElement("Name", item.Name));
            info.Add(new XElement("FormDataSourceTypeId", item.FormDataSourceTypeId));
            node.Add(info);

            var settingsJson = JsonConvert.SerializeObject(item.Settings, Formatting.Indented);
            node.Add(new XElement("Settings", new XCData(settingsJson)));

            return SyncAttempt<XElement>.Succeed(item.Name, node, ChangeType.Export, Array.Empty<uSyncChange>());
        }

        protected override SyncAttempt<FormDataSource> DeserializeCore(XElement node, SyncSerializerOptions options)
        {
            var item = FindItem(node.GetAlias());

            if (item == null)
            {
                item = new FormDataSource();
                item.Id = node.GetKey();
            }

            var info = node.Element("Info");
            if (info != null)
            {
                item.Name = info.Element("Name").ValueOrDefault(node.GetAlias());
                item.FormDataSourceTypeId = info.Element("FormDataSourceTypeId").ValueOrDefault(Guid.Empty);
            }

            var settings = node.Element("Settings").ValueOrDefault(string.Empty);
            if (!string.IsNullOrWhiteSpace(settings))
            {
                item.Settings = JsonConvert.DeserializeObject<Dictionary<string, string>>(settings);
            }

            // SaveItem(item);

            return SyncAttempt<FormDataSource>.Succeed(item.Name, item, ChangeType.Import, Array.Empty<uSyncChange>());
        }

        public override FormDataSource FindItem(int id) => null;

        public override void DeleteItem(FormDataSource item)
            => syncFormService.DeleteDataSource(item);

        public override FormDataSource FindItem(Guid key)
            => syncFormService.GetDataSource(key);

        public override FormDataSource FindItem(string alias)
            => syncFormService.GetDataSource(alias);

        public override string ItemAlias(FormDataSource item)
            => item.Name;

        public override Guid ItemKey(FormDataSource item)
            => item.Id;

        public override void SaveItem(FormDataSource item)
            => syncFormService.SaveDataSource(item);

        protected override XElement CleanseNode(XElement node)
        {
            var cleaned = XElement.Parse(node.ToString());
            cleaned.Attribute("Key").Value = Guid.Empty.ToString();
            return cleaned;
        }

    }
}
