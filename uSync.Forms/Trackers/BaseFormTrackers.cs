using Umbraco.Forms.Core;
using Umbraco.Forms.Core.Models;

using uSync.Core.Serialization;
using uSync.Core.Tracking;

namespace uSync.Forms.Trackers;
public class FormTracker : SyncXmlTrackAndMerger<Form>, ISyncTracker<Form>
{
	public FormTracker(SyncSerializerCollection serializers) 
		: base(serializers)
	{ }
}

public class FormsFolderTracker : SyncXmlTrackAndMerger<Folder>, ISyncTracker<Folder>
{
	public FormsFolderTracker(SyncSerializerCollection serializers)
		: base(serializers)
	{ }
}

public class PreValueTracker : SyncXmlTrackAndMerger<FieldPreValueSource>, ISyncTracker<FieldPreValueSource>
{
	public PreValueTracker(SyncSerializerCollection serializers) 
		: base(serializers)
	{ }
}

public class DataSourceTracker : SyncXmlTrackAndMerger<FormDataSource>, ISyncTracker<FormDataSource>
{
	public DataSourceTracker(SyncSerializerCollection serializers) 
		: base(serializers)
	{ }
}