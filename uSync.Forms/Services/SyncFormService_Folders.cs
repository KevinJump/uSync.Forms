using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Umbraco.Core;
using Umbraco.Forms.Core.Models;

namespace uSync.Forms.Services
{
    public partial class SyncFormService
    {
        private Folder FindFolder(Guid folderId)
        {
            try
            {
                if (_hasFolders && folderService != null)
                {
                    return folderService.Get(folderId);
                }
            }
            catch
            {
                return null;
            }

            return null;
        }

        public string GetFolderPath(Guid folderId)
        {
            var path = "";

            var folder = FindFolder(folderId);
            if (folder != null)
            {
                if (folder.ParentId != null)
                {
                    // has a parent. 
                    path = GetFolderPath(folder.ParentId.Value);
                }
            }

            path += "/" + folder.Name;

            return path;
        }


        public Guid CreateOrFindFolders(Guid parent, string folderPath)
        {
            if (!this.FormsInDb) return Guid.Empty;

            var folderPathClean = folderPath.Trim("/");

            IEnumerable<Folder> folders; 
            if (parent == Guid.Empty)
            {
                folders = folderService.GetAtRoot();
            }
            else
            {
                folders = folderService.GetChildren(parent);
            }

            var folder = folderPathClean;
            if(folderPathClean.IndexOf('/') != -1)
            {
                folder = folderPathClean.Substring(0, folderPathClean.IndexOf('/'));
            }

            var formFolder = folders.FirstOrDefault(x => x.Name.InvariantEquals(folder));

            if (formFolder == null) {

                formFolder = new Folder
                {
                    Name = folder,
                };

                if (parent != Guid.Empty) formFolder.ParentId = parent;

                try
                {
                    formFolder = folderService.Insert(formFolder);
                }
                catch(Exception ex)
                {
                    // error (could be we are importing to something that doesn't 
                    // support folders)
                    return Guid.Empty;
                }
            };

            if (folderPathClean.IndexOf('/') != -1)
            {
                var remaining = folderPathClean.Substring(folderPathClean.IndexOf('/'));
                return CreateOrFindFolders(formFolder.Id, remaining);
            }
            else
            {
                return formFolder.Id;
            }
        }
    }
}
