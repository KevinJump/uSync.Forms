using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using uSync8.BackOffice;
using uSync8.BackOffice.Models;

namespace uSync.Forms
{
    public class uSyncForms : ISyncAddOn
    {
        public string Name => "FormsEdition";

        public string Version => typeof(uSyncForms).Assembly.GetName().Version.ToString();

        public string Icon => null;

        public string View => string.Empty;

        public string Alias => "usyncForms";

        public string DisplayName => "FormsEdition";

        public int SortOrder => 100;


        public static bool HasFolders()
        {
            if (Semver.SemVersion.TryParse(Umbraco.Forms.Core.Configuration.GetVersion(), out Semver.SemVersion formsVersion))
            {
                if (formsVersion >= new Semver.SemVersion(8, 8))
                {
                    return true;
                }
            }
            return false;
        }

    }

    public static class uSyncFormPriorities
    {
        public const int DataSources = uSyncBackOfficeConstants.Priorites.USYNC_RESERVED_UPPER + 2;
        public const int PreValues = uSyncBackOfficeConstants.Priorites.USYNC_RESERVED_UPPER + 1;
        public const int Workflows = uSyncBackOfficeConstants.Priorites.USYNC_RESERVED_UPPER + 5;
        public const int Forms = uSyncBackOfficeConstants.Priorites.USYNC_RESERVED_UPPER + 10;
    }
}
