using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using Umbraco.Extensions;
using Umbraco.Forms.Core.Models;
using Umbraco.Forms.Core.Services;

using uSync.Core.Extensions;

namespace uSync.Forms.Services
{
    public partial class SyncFormService
    {
        private bool IsNew(Folder folder)
            => folder.Id == Guid.Empty || !_folderService.Exists(folder.Id);

        public void SaveFolder(Folder item)
        {
            _ = IsNew(item) ? _folderService.Insert(item) : _folderService.Update(item);
        }

        public void DeleteFolder(Folder item)
            => _folderService.Delete(item);

        public IEnumerable<Folder> GetChildFolders(Guid? parent = null)
        {
            if (parent == null)
                return _folderService.GetAtRoot();

            return _folderService.GetChildren(parent.Value);
        }

        public IEnumerable<Folder> GetAllFolders(Guid? parent = null)
        {
            var folders = new List<Folder>();

            foreach (var folder in GetChildFolders(parent))
            {
                folders.Add(folder);
                folders.AddRange(GetAllFolders(folder.Id));
            }

            return folders;
        }

        public Folder? GetFolder(Guid folderId) 
        {
            try
            {
                return _folderService.Get(folderId);
            }
            catch
            {
                return null;
            }
        }

        // return all the forms in a folder or any of the folders beneath it.
        public IEnumerable<Form> GetFolderForms(Guid folderId)
        {
            var ids = new List<Guid>()
            {
                folderId
            };

            ids.AddRange(GetAllFolders(folderId).Select(x => x.Id));

            return ids.SelectMany(id => _formService.GetFromFolder(id)).ToList();
        }

        public string GetFolderPath(Guid folderId)
        {
            var path = "";
            var folder = GetFolder(folderId);
            if (folder is not null)
            {
                if (folder.ParentId != null)
                {
                    // has a parent. 
                    path = GetFolderPath(folder.ParentId.Value);
                }

            path += "/" +  HttpUtility.UrlEncode(folder?.Name);

            }

            return path;
        }

        public Folder? CreateOrFindFolders(Guid parent, string folderPath)
        {
            return CreateOrFindFoldersInternal(parent, folderPath, null);
        }

        /// <summary>
        ///  find or create the folders in a path, if the last folder in the path has
        ///  to be created it is given the id passed in.
        /// </summary>
        public Folder? CreateOrFindFolders(Guid parent, string folderPath, Guid? folderId)
        {
            return CreateOrFindFoldersInternal(parent, folderPath, folderId);
        }

        private Folder? CreateOrFindFoldersInternal(Guid parent, string folderPath, Guid? folderId)
        {
            var folderPathClean = folderPath.Trim('/');

            IEnumerable<Folder> folders;
            if (parent == Guid.Empty)
            {
                folders = _folderService.GetAtRoot();
            }
            else
            {
                folders = _folderService.GetChildren(parent);
            }

            var folder = folderPathClean;
            if (folderPathClean.Contains('/'))
            {
                folder = folderPathClean.Substring(0, folderPathClean.IndexOf('/'));
            }

            // the path is made of url encoded folder names.
            var folderName = HttpUtility.UrlDecode(folder);
            var isLastFolder = !folderPathClean.Contains('/');

            var formFolder = folders.FirstOrDefault(x => x.Name.InvariantEquals(folderName));

            if (formFolder == null)
            {
                formFolder = new Folder
                {
                    Name = folderName,
                };

                if (parent != Guid.Empty) formFolder.ParentId = parent;
                if (isLastFolder && folderId != null && folderId != Guid.Empty) formFolder.Id = folderId.Value;

                try
                {
                    formFolder = _folderService.Insert(formFolder);
                }
                catch
                {
                    // error (could be we are importing to something that doesn't 
                    // support folders)
                    return null;
                }
            }

            if (folderPathClean.Contains('/'))
            {
                var remaining = folderPathClean.Substring(folderPathClean.IndexOf('/'));
                return CreateOrFindFoldersInternal(formFolder?.Id ?? Guid.Empty, remaining, folderId);
            }
            else
            {
                return formFolder;
            }
        }

        public Task<Folder?> CreateOrFindFoldersWithIdAsync(Guid parentId, Guid key, string name)
        {
            return uSyncTaskHelper.FromResultOf<Folder?>(() =>
            {
                var formFolder = _folderService.Get(key);
                if (formFolder != null)
                {
                    return formFolder;
                }

                if (parentId != Guid.Empty)
                {
                    var parentFolder = _folderService.Get(parentId);
                    if (parentFolder == null)
                    {
                        //no parent exist, we need to create it by path
                        return null;
                    }
                }

                formFolder = new Folder
                {
                    Name = name,

                };
                if (parentId != Guid.Empty) formFolder.ParentId = parentId;
                formFolder.Id = key;
                try
                {
                    formFolder = _folderService.Insert(formFolder);
                }
                catch
                {
                    // error (could be we are importing to something that doesn't 
                    // support folders)
                    return null;
                }

                return formFolder;
            });
        }

        public int GetFolderLevel(Guid folderId)
        {
            var path = 0;
            var folder = GetFolder(folderId);
            if (folder != null)
            {
                if (folder.ParentId != null)
                {
                    // has a parent. 
                    path++;
                    path += GetFolderLevel(folder.ParentId.Value);
                }
            }


            return path;
        }
    }
}