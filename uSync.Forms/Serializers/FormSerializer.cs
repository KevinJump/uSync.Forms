using System;
using System.Collections.Generic;
using System.Linq;
using System.Xml.Linq;

using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

using Umbraco.Core;
using Umbraco.Core.Logging;
using Umbraco.Core.Services;
using Umbraco.Forms.Core;
using Umbraco.Forms.Core.Enums;
using Umbraco.Forms.Core.Models;

using uSync.Forms.Services;

using uSync8.Core;
using uSync8.Core.Extensions;
using uSync8.Core.Models;
using uSync8.Core.Serialization;

using static Umbraco.Core.Constants;

namespace uSync.Forms.Serializers
{
    [SyncSerializer("AFB4DECC-2828-4414-B85F-ADC1BF711521", "Forms Serializer", UdiEntityType.FormsForm, IsTwoPass = false)]
    public class FormSerializer : SyncSerializerRoot<Form>, ISyncNodeSerializer<Form>
    {
        private readonly IEntityService entityService;
        private readonly SyncFormService syncFormService;

        public FormSerializer(
            SyncFormService syncFormService,
            IEntityService entityService,
            ILogger logger)
            : base(logger)
        {
            this.entityService = entityService;
            this.syncFormService = syncFormService;
        }

        protected override SyncAttempt<XElement> SerializeCore(Form item, SyncSerializerOptions options)
        {
            var node = new XElement(ItemType,
                new XAttribute("Key", ItemKey(item)),
                new XAttribute("Alias", ItemAlias(item)));

            var info = new XElement("Info");
            info.Add(new XElement("Name", item.Name));
            // info.Add(new XElement("Created", item.Created));

            info.Add(new XElement("FieldIndicationType", item.FieldIndicationType));
            info.Add(new XElement("Indicator", item.Indicator));
            info.Add(new XElement("ShowValidationSummary", item.ShowValidationSummary));
            info.Add(new XElement("HideFieldValidation", item.HideFieldValidation));
            info.Add(new XElement("RequireErrorMessage", item.RequiredErrorMessage));
            info.Add(new XElement("InvalidErrorMessage", item.InvalidErrorMessage));
            info.Add(new XElement("MessageOnSubmit", item.MessageOnSubmit));

            info.Add(new XElement("GoToPageOnSubmit", GetContentKey(item.GoToPageOnSubmit)));

            info.Add(new XElement("XPathOnSubmit", item.XPathOnSubmit ?? string.Empty));
            info.Add(new XElement("ManualApproval", item.ManualApproval));
            info.Add(new XElement("StoreRecordsLocally", item.StoreRecordsLocally));
            info.Add(new XElement("CssClass", item.CssClass ?? string.Empty));
            info.Add(new XElement("DisabledDefaultStylesheet", item.DisableDefaultStylesheet));
            info.Add(new XElement("UseClientDependency", item.UseClientDependency));
            
            info.Add(SerializeWorkflows(item));
            info.Add(SerializeDataSource(item.DataSource));

            info.Add(new XElement("SubmitLabel", item.SubmitLabel));
            info.Add(new XElement("NextLabel", item.NextLabel));
            info.Add(new XElement("PreVLabel", item.PrevLabel));

            node.Add(info);

            node.Add(SerializePages(item.Pages));
            
            return SyncAttempt<XElement>.Succeed(item.Name, node, ChangeType.Export);
        }

        private XElement SerializePages(IEnumerable<Page> pages)
        {
            var node = new XElement("Pages");

            if (pages != null)
            {
                var jArray = JArray.FromObject(pages);
                node.Add(new XCData(MapPropertyValueIdToNames(jArray)));
            }

            return node;
        }

        private string MapPropertyValueIdToNames(JArray jArray)
        {
            foreach(var item in jArray.Cast<JObject>())
            {
                var fieldSets = GetArray(item, "fieldSets");
                foreach(var fieldSet in fieldSets.Cast<JObject>())
                {
                    var containers = GetArray(fieldSet, "containers");
                    foreach (var container in containers.Cast<JObject>())
                    {
                        var fields = GetArray(container, "fields");
                        foreach (var field in fields.Cast<JObject>())
                        {
                            var attempt = GetObjectValue<Guid>(field, "prevalueSourceId");
                            if (attempt && attempt.Result != Guid.Empty)
                            {
                                var prevalue = syncFormService.GetPreValueSource(attempt.Result);
                                if (prevalue != null)
                                {
                                    field["prevalueSourceId"] = prevalue.Name;
                                }
                            }
                        }
                    }
                }
            }

            return jArray.ToString(Formatting.Indented);
        }

        private JArray MapPropertySourceNamesToId(JArray jArray)
        {
            foreach (var item in jArray.Cast<JObject>())
            {
                var fieldSets = GetArray(item, "fieldSets");
                foreach (var fieldSet in fieldSets.Cast<JObject>())
                {
                    var containers = GetArray(fieldSet, "containers");
                    foreach (var container in containers.Cast<JObject>())
                    {
                        var fields = GetArray(container, "fields");
                        foreach (var field in fields.Cast<JObject>())
                        {
                            var attempt = GetObjectValue<string>(field, "prevalueSourceId");
                            if (attempt && attempt.Result != Guid.Empty.ToString())
                            {
                                var prevalue = syncFormService.GetPreValueSource(attempt.Result);
                                if (prevalue != null)
                                {
                                    field["prevalueSourceId"] = prevalue.Id;
                                }
                            }
                        }
                    }
                }
            }

            return jArray;
        }

        private JArray GetArray(JObject obj, string propertyName)
        {
            if (obj.TryGetValue(propertyName, out JToken token))
            {
                if (token is JArray array)
                    return array;
            }

            return new JArray();
        }
        private Attempt<TObject> GetObjectValue<TObject>(JObject obj, string propertyName)
        {
            if (obj.TryGetValue(propertyName, out JToken token))
            {
                return token.TryConvertTo<TObject>();
            }

            return Attempt<TObject>.Fail();
        }


        protected override SyncAttempt<Form> DeserializeCore(XElement node, SyncSerializerOptions options)
        {
            var item = FindItem(node.GetKey());
            if (item == null)
            {
                item = FindItem(node.GetAlias());
            }

            if (item == null)
            {
                item = new Form();
                item.Id = node.GetKey();
            }

            DeserializeInfo(node, item);

            DeserializePages(node, item);

            // SaveItem(item);

            return SyncAttempt<Form>.Succeed(item.Name, item, ChangeType.Import);
        }

        private void DeserializeInfo(XElement node, Form item) 
        {
            var info = node.Element("Info");
            if (info == null) return;

            item.Name = info.Element("Name").ValueOrDefault(node.GetAlias());

            item.FieldIndicationType = info.Element("FieldIndicationType").ValueOrDefault(FormFieldIndication.MarkMandatoryFields);
            item.Indicator = info.Element("Indicator").ValueOrDefault("*");

            item.ShowValidationSummary = info.Element("ShowValidationSummary").ValueOrDefault(false);
            item.HideFieldValidation = info.Element("HideFieldValidation").ValueOrDefault(false);
            item.RequiredErrorMessage = info.Element("RequireErrorMessage").ValueOrDefault(string.Empty);
            item.InvalidErrorMessage = info.Element("InvalidErrorMessage").ValueOrDefault(string.Empty);
            item.MessageOnSubmit = info.Element("MessageOnSubmit").ValueOrDefault(string.Empty);
            
            item.GoToPageOnSubmit = GetContentId(info.Element("GoToPageOnSubmit").ValueOrDefault(Guid.Empty));

            item.XPathOnSubmit = info.Element("XPathOnSubmit").ValueOrDefault(string.Empty);
            item.ManualApproval = info.Element("ManualApproval").ValueOrDefault(false);
            item.StoreRecordsLocally = info.Element("StoreRecordsLocally").ValueOrDefault(false);
            item.CssClass = info.Element("CssClass").ValueOrDefault(string.Empty);
            item.DisableDefaultStylesheet = info.Element("DisabledDefaultStylesheet").ValueOrDefault(false);
            item.UseClientDependency = info.Element("UseClientDependency").ValueOrDefault(false);

            item.SubmitLabel = info.Element("SubmitLabel").ValueOrDefault(string.Empty);
            item.NextLabel = info.Element("NextLabel").ValueOrDefault(string.Empty);
            item.PrevLabel = info.Element("PreVLabel").ValueOrDefault(string.Empty);

            // have to save before we do the workflow and source. 
            SaveItem(item);

            DeserializeWorkdlows(info, item);
            DesersilizeDataSource(info, item);
        }


        private XElement SerializeWorkflows(Form form)
        {
            var workflows = syncFormService.GetWorkflows(form);

            var node = new XElement("Workflows");

            foreach (var workflow in workflows)
            {
                var wNode = new XElement("Workflow");
                wNode.Add(new XElement(nameof(workflow.Id), workflow.Id));
                wNode.Add(new XElement(nameof(workflow.Name), workflow.Name));
                wNode.Add(new XElement(nameof(workflow.Active), workflow.Active));
                wNode.Add(new XElement(nameof(workflow.IncludeSensitiveData), workflow.IncludeSensitiveData));
                wNode.Add(new XElement(nameof(workflow.WorkflowTypeId), workflow.WorkflowTypeId));
                wNode.Add(new XElement(nameof(workflow.ExecutesOn), workflow.ExecutesOn));
                wNode.Add(new XElement(nameof(workflow.SortOrder), workflow.SortOrder));
                wNode.Add(new XElement(nameof(workflow.Settings),
                    new XCData(JsonConvert.SerializeObject(workflow.Settings, Formatting.Indented))));

                node.Add(wNode);
            }
            return node;
        }


        private void DeserializeWorkdlows(XElement info, Form form)
        {

            var node = info.Element("Workflows");
            if (node != null)
            {
                var workflows = new List<Workflow>();

                int n = 0;

                foreach(var wNode in node.Elements("Workflow"))
                {
                    n++;

                    var workflow = new Workflow();
                    workflow.Form = form.Id;
                    workflow.Id = wNode.Element(nameof(workflow.Id)).ValueOrDefault(Guid.NewGuid());
                    workflow.Name = wNode.Element(nameof(workflow.Name)).ValueOrDefault("Unknown");
                    workflow.Active = wNode.Element(nameof(workflow.Active)).ValueOrDefault(true);
                    workflow.IncludeSensitiveData = wNode.Element(nameof(workflow.IncludeSensitiveData)).ValueOrDefault(IncludeSensitiveData.False);
                    workflow.WorkflowTypeId = wNode.Element(nameof(workflow.WorkflowTypeId)).ValueOrDefault(Guid.Empty);
                    workflow.ExecutesOn = wNode.Element(nameof(workflow.ExecutesOn)).ValueOrDefault(FormState.Submitted);
                    workflow.SortOrder = wNode.Element(nameof(workflow.SortOrder)).ValueOrDefault(n);

                    var settings = wNode.Element(nameof(workflow.Settings)).ValueOrDefault(string.Empty);
                    if (!string.IsNullOrWhiteSpace(settings))
                    {
                        workflow.Settings = JsonConvert.DeserializeObject<Dictionary<string, string>>(settings);
                    }

                    syncFormService.SaveWorkflow(workflow, form);
                }
            }
        }

        private XElement SerializeDataSource(FormDataSourceDefinition dataSourceDefinition)
        {
            var node = new XElement("DataSource");

            if (dataSourceDefinition != null)
            {
                var dataSource = syncFormService.GetDataSource(dataSourceDefinition.Id);

                node.Add(new XElement("Source", dataSource?.Name ?? dataSourceDefinition.Id.ToString()));
                var mappingsNode = new XElement("Mappings");

                foreach (var mapping in dataSourceDefinition.Mappings)
                {
                    var mNode = new XElement("Mapping");

                    mNode.Add(new XElement(nameof(mapping.DataFieldKey), mapping.DataFieldKey));
                    mNode.Add(new XElement(nameof(mapping.PrevalueKeyfield), mapping.PrevalueKeyfield));
                    mNode.Add(new XElement(nameof(mapping.PrevalueValueField), mapping.PrevalueValueField));
                    mNode.Add(new XElement(nameof(mapping.PrevalueTable), mapping.PrevalueTable));
                    mNode.Add(new XElement(nameof(mapping.DataType), mapping.DataType));
                    mNode.Add(new XElement(nameof(mapping.DefaultValue), mapping.DefaultValue));

                    mappingsNode.Add(mNode);
                }

                node.Add(mappingsNode);
            }

            return node;
        }


        private void DesersilizeDataSource(XElement info, Form item)
        {
            var node = info.Element("DataSource");
            if (node == null) return;

            var dataSourceDefinition = new FormDataSourceDefinition()
            {
                Mappings = new List<FormDataSourceMapping>()
            };

            var source = node.Element("Source").ValueOrDefault(string.Empty);
            if (string.IsNullOrWhiteSpace(source)) return;

            var dataSource = syncFormService.GetDataSource(source);
            if (dataSource != null)
            {
                dataSourceDefinition.Id = dataSource.Id;
            }
            else if (Guid.TryParse(source, out Guid id))
            {
                dataSourceDefinition.Id = id;
            }

            var mappingNode = node.Element("Mappings");
            if (mappingNode != null)
            {

                foreach (var mNode in mappingNode.Elements("Mapping"))
                {
                    var mapping = new FormDataSourceMapping();
                    mapping.DataFieldKey = mNode.Element(nameof(mapping.DataFieldKey)).ValueOrDefault(string.Empty);
                    mapping.PrevalueKeyfield = mNode.Element(nameof(mapping.PrevalueKeyfield)).ValueOrDefault(string.Empty);
                    mapping.PrevalueValueField = mNode.Element(nameof(mapping.PrevalueValueField)).ValueOrDefault(string.Empty);
                    mapping.PrevalueTable = mNode.Element(nameof(mapping.PrevalueTable)).ValueOrDefault(string.Empty);
                    mapping.DataType = mNode.Element(nameof(mapping.DataType)).ValueOrDefault(FieldDataType.String);
                    mapping.DefaultValue = mNode.Element(nameof(mapping.DefaultValue)).ValueOrDefault(string.Empty);

                    dataSourceDefinition.Mappings.Add(mapping);
                }
            }

            item.DataSource = dataSourceDefinition;
        }

        private void DeserializePages(XElement node, Form item) 
        {
            var pagesJson = node.Element("Pages").ValueOrDefault(string.Empty);
            if (!string.IsNullOrWhiteSpace(pagesJson))
            {
                var array = MapPropertySourceNamesToId(JsonConvert.DeserializeObject<JArray>(pagesJson));

                var pages = array.ToObject<List<Page>>();
                if (pages != null)
                    item.Pages = pages;
            }
        }

        protected override SyncAttempt<Form> ProcessDelete(Guid key, string alias, SerializerFlags flags)
        {
            var form = FindItem(alias);
            if (form != null)
            {
                syncFormService.DeleteForm(form);
                return SyncAttempt<Form>.Succeed(alias, ChangeType.Delete);
            }

            return SyncAttempt<Form>.Succeed(alias, ChangeType.NoChange);
        }

        protected override SyncAttempt<Form> ProcessRename(Guid key, string alias, SerializerFlags flags)
            => SyncAttempt<Form>.Succeed(alias, ChangeType.NoChange);


        protected override void DeleteItem(Form item)
            => syncFormService.DeleteForm(item);

        protected override Form FindItem(Guid key)
            => syncFormService.GetForm(key);

        protected override Form FindItem(string alias)
            => syncFormService.GetForm(alias);

        protected override string ItemAlias(Form item)
            => item.Name;

        protected override Guid ItemKey(Form item)
            => item.Id;

        protected override void SaveItem(Form item)
            => syncFormService.SaveForm(item);

        private Guid GetContentKey(int id)
        {
            if (id > 0) {
                var attempt = entityService.GetKey(id, Umbraco.Core.Models.UmbracoObjectTypes.Document);
                if (attempt.Success) return attempt.Result;
            }
            return Guid.Empty;
        }

        private int GetContentId(Guid key)
        {
            if (key != Guid.Empty)
            {
                var attempt = entityService.GetId(key, Umbraco.Core.Models.UmbracoObjectTypes.Document);
                if (attempt.Success) return attempt.Result;
            }

            return 0;
        }


        protected override XElement CleanseNode(XElement node)
        {
            node.Attribute("Key").Value = Guid.Empty.ToString();
            return node;
        }


    }
}
