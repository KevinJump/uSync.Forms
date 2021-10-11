
using uSync.BackOffice;
using uSync.BackOffice.Models;

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

        // v9 has folders 
        public static bool HasFolders() => true;
    }

    public static class uSyncFormPriorities
    {
        public const int DataSources = uSyncConstants.Priorites.USYNC_RESERVED_UPPER + 2;
        public const int PreValues = uSyncConstants.Priorites.USYNC_RESERVED_UPPER + 1;
        public const int Workflows = uSyncConstants.Priorites.USYNC_RESERVED_UPPER + 5;
        public const int Forms = uSyncConstants.Priorites.USYNC_RESERVED_UPPER + 10;
    }
}
