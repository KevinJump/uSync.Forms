using Microsoft.Extensions.Logging;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;

using Umbraco.Extensions;
using Umbraco.Forms.Core.Models;

using uSync.Core;
using uSync.Core.Models;
using uSync.Core.Serialization;
using uSync.Forms.Services;

using static Umbraco.Cms.Core.Constants;

namespace uSync.Forms.Serializers
{
    [SyncSerializer("30555FC4-6DD9-4711-B3F9-D4AA9A7C43F4", "Forms folder Serializer", uSyncForms.FolderEntityType, IsTwoPass = false)]
    public class FolderSerializer : SyncSerializerRoot<Folder>, ISyncSerializer<Folder>
    {
        private readonly SyncFormService _syncFormService;
        public FolderSerializer(ILogger<SyncSerializerRoot<Folder>> logger, SyncFormService syncFormService) : base(logger)
        {
            _syncFormService = syncFormService;
        }

        public override void DeleteItem(Folder item)
            => _syncFormService.DeleteFolder(item);

        public override Folder FindItem(int id) => null;

        public override Folder FindItem(Guid key) => _syncFormService.GetFolder(key);

        public override Folder FindItem(string alias) => null;

        public override string ItemAlias(Folder item) => item.Name;

        public override Guid ItemKey(Folder item) => item.Id;

        public override void SaveItem(Folder item)
            => _syncFormService.SaveFolder(item);

        protected override SyncAttempt<Folder> DeserializeCore(XElement node, SyncSerializerOptions options)
        {
            var item = CreateOrFindFolder(node);

            if (item == null)
            {
                item = new Folder();
                item.Id = node.GetKey();
            }

            var name = node.Element("Info")?.Element("Name").ValueOrDefault(node.GetAlias());
            if (!string.IsNullOrWhiteSpace(name) && item.Name != name)
                item.Name = name;

            Guid? parent = node.Element("Info")?.Element("Parent").ValueOrDefault<Guid?>(null);
            if (item.ParentId != parent)
                item.ParentId = parent;

            return SyncAttempt<Folder>.Succeed(item.Name, item, ChangeType.Import, Array.Empty<uSyncChange>());
        }

        private Folder CreateOrFindFolder(XElement node)
        {
            var item = FindItem(node.GetKey());
            if (item != null) return item;

            var info = node.Element("Info");
            if (info == null) return null;

            var parentId = info.Element("Parent").ValueOrDefault(Guid.Empty);
            var name = info.Element("Name").ValueOrDefault(node.GetAlias());
            if (parentId != Guid.Empty)
            {
                item = _syncFormService.CreateOrFindFolders(parentId, name);
                if (item != null) return item;
            }

            var path = info.Element("Path").ValueOrDefault(string.Empty);
            if (!string.IsNullOrWhiteSpace(path))
            {
                return _syncFormService.CreateOrFindFolders(Guid.Empty, path);
            }

            return null;
        }

        protected override SyncAttempt<XElement> SerializeCore(Folder item, SyncSerializerOptions options)
        {
            var node = new XElement(ItemType,
                new XAttribute("Key", ItemKey(item)),
                new XAttribute("Alias", ItemAlias(item)));

            var info = new XElement("Info");
            info.Add(new XElement("Name", item.Name));
            info.Add(new XElement("Parent", item.ParentId));
            info.Add(new XElement("Path", _syncFormService.GetFolderPath(item.Id)));

            node.Add(info);

            return SyncAttempt<XElement>.Succeed(item.Name, node, ChangeType.Export, Array.Empty<uSyncChange>());
        }
    }
}
