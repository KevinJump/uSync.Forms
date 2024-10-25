using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Xml.Linq;

using Microsoft.Extensions.Logging;

using Newtonsoft.Json;

using Umbraco.Forms.Core;

using uSync.Core;
using uSync.Core.Extensions;
using uSync.Core.Models;
using uSync.Core.Serialization;
using uSync.Forms.Services;

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

        protected override Task<SyncAttempt<XElement>> SerializeCoreAsync(FormDataSource item, SyncSerializerOptions options)
        {
            return uSyncTaskHelper.FromResultOf(() =>
            {
                var node = this.InitializeBaseNode(item, item.Name);

                var info = new XElement("Info",
                    new XElement("Name", item.Name),
                    new XElement("FormDataSourceTypeId", item.FormDataSourceTypeId));

                node.Add(info);

                var settingsJson = JsonConvert.SerializeObject(item.Settings, Formatting.Indented);
                node.Add(new XElement("Settings", new XCData(settingsJson)));

                return SyncAttempt<XElement>.Succeed(item.Name, node, ChangeType.Export, Array.Empty<uSyncChange>());
            });
        }

        protected override async Task<SyncAttempt<FormDataSource>> DeserializeCoreAsync(XElement node, SyncSerializerOptions options)
        { 
            var item = await FindItemAsync(node.GetAlias());

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
                item.Settings = JsonConvert.DeserializeObject<Dictionary<string, string>>(settings) ?? [];
            }

            // SaveItem(item);

            return SyncAttempt<FormDataSource>.Succeed(item.Name, item, ChangeType.Import, Array.Empty<uSyncChange>());
        }

        public override Task DeleteItemAsync(FormDataSource item)
            => uSyncTaskHelper.FromResultOf(() => syncFormService.DeleteDataSource(item));

        public override Task<FormDataSource?> FindItemAsync(Guid key)
            => uSyncTaskHelper.FromResultOf<FormDataSource?>(() => syncFormService.GetDataSource(key));

        public override Task<FormDataSource?> FindItemAsync(string alias)
            => uSyncTaskHelper.FromResultOf<FormDataSource?>(() => syncFormService.GetDataSource(alias));

        public override string ItemAlias(FormDataSource item)
            => item.Name;

        public override Guid ItemKey(FormDataSource item)
            => item.Id;

        public override Task SaveItemAsync(FormDataSource item)
            => uSyncTaskHelper.FromResultOf(() => syncFormService.SaveDataSource(item));

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
