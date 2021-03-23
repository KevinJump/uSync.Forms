
using Microsoft.Web.XmlTransform;
using System.Xml.Linq;
using Umbraco.Core.IO;
using Umbraco.Core.PackageActions;

namespace uSync.Forms
{
    public class uSyncFormsPackageAction : IPackageAction
    {
        public string Alias()
        {
            return "uSyncForms.TransformConfig";
        }

        private bool Transform(string packageName, XElement xmlData, bool uninstall = false)
        {
            // The config file we want to modify
            var file = xmlData.Attribute("file").Value;

            string sourceDocFileName = IOHelper.MapPath(file);

            // The xdt file used for tranformation 
            var fileEnd = "install.xdt";
            if (uninstall)
            {
                fileEnd = string.Format("un{0}", fileEnd);
            }

            var xdtfile = string.Format("{0}.{1}", xmlData.Attribute("xdtfile").Value, fileEnd);
            string xdtFileName = IOHelper.MapPath(xdtfile);

            // The translation at-hand
            using (var xmlDoc = new XmlTransformableDocument())
            {
                xmlDoc.PreserveWhitespace = true;
                xmlDoc.Load(sourceDocFileName);

                using (var xmlTrans = new XmlTransformation(xdtFileName))
                {
                    if (xmlTrans.Apply(xmlDoc))
                    {
                        // If we made it here, sourceDoc now has transDoc's changes
                        // applied. So, we're going to save the final result off to
                        // destDoc.
                        xmlDoc.Save(sourceDocFileName);
                    }
                }
            }

            return true;
        }

        public bool Execute(string packageName, XElement xmlData)
        {
            return Transform(packageName, xmlData);
        }

        public bool Undo(string packageName, XElement xmlData)
        {
            return Transform(packageName, xmlData, true);
        }
    }
}
