import React, { useState } from 'react';
import {
  Settings,
  Database,
  Building,
  Shield,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Save,
  Key,
  Layers,
  Plus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
  isSupabaseConfigured,
} from '../../services/supabaseClient';
import { dbGetAll } from '../../services/offlineDb';

export const SettingsView: React.FC = () => {
  const {
    schoolProfile,
    setSchoolProfile,
    auditLogs,
    showToast,
    refreshAllData,
    streams,
    addStream,
    updateStream,
    classes,
    updateClass,
    students,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'school' | 'streams' | 'supabase' | 'backup' | 'audit'>('school');

  // Stream management in settings
  const [newStreamName, setNewStreamName] = useState('');
  const [selectedClassIdsForNewStream, setSelectedClassIdsForNewStream] = useState<string[]>([]);
  const [editingStream, setEditingStream] = useState<{ id: string; name: string; is_active: boolean } | null>(null);
  const [assigningClassesStream, setAssigningClassesStream] = useState<{ id: string; name: string } | null>(null);
  const [assignedClassIds, setAssignedClassIds] = useState<string[]>([]);

  const handleCreateStream = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreamName.trim()) return;
    const streamName = newStreamName.trim();
    await addStream({
      name: streamName,
      is_active: true,
    });

    // Assign stream to selected classes
    if (selectedClassIdsForNewStream.length > 0) {
      for (const classId of selectedClassIdsForNewStream) {
        const cls = classes.find((c) => c.id === classId);
        if (cls) {
          const streamExists = cls.streams?.some((st) => st.name.toLowerCase() === streamName.toLowerCase());
          if (!streamExists) {
            const newStreamObj = {
              id: `str-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              name: streamName,
              class_id: cls.id,
              is_active: true,
            };
            const updatedStreams = [...(cls.streams || []), newStreamObj];
            await updateClass({
              ...cls,
              streams: updatedStreams,
            });
          }
        }
      }
    }

    setNewStreamName('');
    setSelectedClassIdsForNewStream([]);
    showToast(
      `Stream "${streamName}" created and assigned to ${selectedClassIdsForNewStream.length} classes!`,
      'success'
    );
  };

  const handleOpenAssignModal = (stream: { id: string; name: string }) => {
    setAssigningClassesStream(stream);
    const classesUsing = classes
      .filter((c) => c.streams?.some((st) => st.name.toLowerCase() === stream.name.toLowerCase()))
      .map((c) => c.id);
    setAssignedClassIds(classesUsing);
  };

  const handleSaveAssignedClasses = async () => {
    if (!assigningClassesStream) return;
    const streamName = assigningClassesStream.name;

    for (const cls of classes) {
      const isSelected = assignedClassIds.includes(cls.id);
      const currentlyHas = cls.streams?.some((st) => st.name.toLowerCase() === streamName.toLowerCase());

      if (isSelected && !currentlyHas) {
        const newStreamObj = {
          id: `str-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: streamName,
          class_id: cls.id,
          is_active: true,
        };
        await updateClass({
          ...cls,
          streams: [...(cls.streams || []), newStreamObj],
        });
      } else if (!isSelected && currentlyHas) {
        const filteredStreams = (cls.streams || []).filter((st) => st.name.toLowerCase() !== streamName.toLowerCase());
        await updateClass({
          ...cls,
          streams: filteredStreams,
        });
      }
    }

    showToast(`Class allocation for Stream "${streamName}" updated successfully!`, 'success');
    setAssigningClassesStream(null);
  };

  const handleUpdateStream = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStream || !editingStream.name.trim()) return;
    await updateStream({
      ...editingStream,
      name: editingStream.name.trim(),
    });
    setEditingStream(null);
    showToast('Stream settings updated!', 'success');
  };

  // School profile form
  const [profileForm, setProfileForm] = useState({
    name: schoolProfile.name,
    motto: schoolProfile.motto,
    address: schoolProfile.address,
    district: schoolProfile.district,
    country: schoolProfile.country,
    phone: schoolProfile.phone,
    alt_phone: schoolProfile.alt_phone,
    email: schoolProfile.email,
    website: schoolProfile.website,
    currency: schoolProfile.currency,
    timezone: schoolProfile.timezone,
    current_academic_year: schoolProfile.current_academic_year,
    current_term: schoolProfile.current_term,
  });

  // Supabase config form
  const currentSupabase = getSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(currentSupabase.url);
  const [supabaseKey, setSupabaseKey] = useState(currentSupabase.publishableKey);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await setSchoolProfile({
      ...schoolProfile,
      ...profileForm,
    });
  };

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(supabaseUrl, supabaseKey);
    showToast('Supabase configuration saved to device!', 'success');
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      // Save current input before testing
      saveSupabaseConfig(supabaseUrl, supabaseKey);
      const res = await testSupabaseConnection();
      setTestResult(res);
      if (res.success) {
        showToast(res.message, 'success');
      } else {
        showToast(res.message, 'warning');
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handleExportFullBackup = async () => {
    const stores = [
      'students',
      'parents',
      'teachers',
      'classes',
      'subjects',
      'attendance',
      'fee_structures',
      'payments',
      'exams',
      'results',
      'library_books',
      'inventory_items',
      'discipline_records',
      'notifications',
      'school_settings',
      'audit_logs',
    ];

    const backupData: any = {
      export_date: new Date().toISOString(),
      school: schoolProfile.name,
      country: 'Uganda',
      currency: 'UGX',
      stores: {},
    };

    for (const store of stores) {
      backupData.stores[store] = await dbGetAll(store);
    }

    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', jsonStr);
    link.setAttribute('download', `EduCore_Database_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Complete JSON database backup generated!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-700 dark:text-blue-400" />
            System & Cloud Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ugandan School Particulars • Supabase Cloud Sync • Database Backups & Audit Trail
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 text-xs font-bold">
        <button
          onClick={() => setActiveTab('school')}
          className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'school'
              ? 'border-blue-700 text-blue-700 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>School Information & Uganda Localization</span>
        </button>

        <button
          onClick={() => setActiveTab('streams')}
          className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'streams'
              ? 'border-blue-700 text-blue-700 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Streams Configuration ({streams.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('supabase')}
          className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'supabase'
              ? 'border-blue-700 text-blue-700 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Supabase Cloud Sync</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'backup'
              ? 'border-blue-700 text-blue-700 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Data Safety & Backup</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'audit'
              ? 'border-blue-700 text-blue-700 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Audit Logs ({auditLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: SCHOOL INFO */}
      {activeTab === 'school' && (
        <form onSubmit={handleSaveProfile} className="p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                Official School Name *
              </label>
              <input
                type="text"
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                School Motto / Slogan
              </label>
              <input
                type="text"
                value={profileForm.motto}
                onChange={(e) => setProfileForm({ ...profileForm, motto: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 italic"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                Physical Campus Address
              </label>
              <input
                type="text"
                value={profileForm.address}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                District (Uganda)
              </label>
              <input
                type="text"
                value={profileForm.district}
                onChange={(e) => setProfileForm({ ...profileForm, district: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                Country
              </label>
              <input
                type="text"
                disabled
                value={profileForm.country}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                Primary Phone (+256...)
              </label>
              <input
                type="text"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                Alternative Phone / Hotline
              </label>
              <input
                type="text"
                value={profileForm.alt_phone}
                onChange={(e) => setProfileForm({ ...profileForm, alt_phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                Official Email
              </label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                Currency & Code
              </label>
              <input
                type="text"
                disabled
                value="Uganda Shilling (UGX)"
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                Current Academic Year
              </label>
              <input
                type="text"
                value={profileForm.current_academic_year}
                onChange={(e) => setProfileForm({ ...profileForm, current_academic_year: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                Current Term
              </label>
              <select
                value={profileForm.current_term}
                onChange={(e) => setProfileForm({ ...profileForm, current_term: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold"
              >
                <option value="Term 1">Term 1</option>
                <option value="Term 2">Term 2</option>
                <option value="Term 3">Term 3</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold shadow-md transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save School Settings</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB: STREAMS CONFIGURATION */}
      {activeTab === 'streams' && (
        <div className="space-y-6">
          {/* Header Info */}
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                School Stream Names & Allocations
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                Set and manage global stream names (e.g. Gold, Blue, Silver, North, Nile) configured for classes across the school.
              </p>
            </div>
          </div>

          {/* Add New Stream Form */}
          <form onSubmit={handleCreateStream} className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[240px]">
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  New Stream Name *
                </label>
                <input
                  type="text"
                  required
                  value={newStreamName}
                  onChange={(e) => setNewStreamName(e.target.value)}
                  placeholder="e.g. Diamond, Rwenzori, Nile, Platinum, Orange..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>

              <button
                type="submit"
                className="mt-4 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Create & Assign Stream</span>
              </button>
            </div>

            {/* Provision for assigning classes to new stream */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                  Assign Stream to Classes (Select Applicable Classes):
                </span>
                <div className="flex items-center gap-2 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setSelectedClassIdsForNewStream(classes.map((c) => c.id))}
                    className="text-blue-600 hover:underline font-bold cursor-pointer"
                  >
                    Select All Classes
                  </button>
                  <span className="text-slate-400">•</span>
                  <button
                    type="button"
                    onClick={() => setSelectedClassIdsForNewStream([])}
                    className="text-slate-500 hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {classes.map((cls) => {
                  const isChecked = selectedClassIdsForNewStream.includes(cls.id);
                  return (
                    <label
                      key={cls.id}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-[11px] cursor-pointer transition ${
                        isChecked
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-bold'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedClassIdsForNewStream([...selectedClassIdsForNewStream, cls.id]);
                          } else {
                            setSelectedClassIdsForNewStream(
                              selectedClassIdsForNewStream.filter((id) => id !== cls.id)
                            );
                          }
                        }}
                        className="rounded text-blue-600"
                      />
                      <span>{cls.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </form>

          {/* Streams Table */}
          <div className="rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase">
                <tr>
                  <th className="px-4 py-3">Stream Name</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Active Learners</th>
                  <th className="px-4 py-3">Assigned Classes</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {streams.map((st) => {
                  const learnerCount = students.filter((s) => s.stream_name?.toLowerCase() === st.name.toLowerCase()).length;
                  const classesUsing = classes.filter((c) =>
                    c.streams?.some((s) => s.name.toLowerCase() === st.name.toLowerCase())
                  );

                  return (
                    <tr key={st.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                        {editingStream?.id === st.id ? (
                          <input
                            type="text"
                            value={editingStream.name}
                            onChange={(e) => setEditingStream({ ...editingStream, name: e.target.value })}
                            className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-900 border border-blue-500 font-bold"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                            <span>Stream {st.name}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            st.is_active
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {st.is_active ? 'Active Stream' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {learnerCount} learners enrolled
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {classesUsing.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {classesUsing.map((c) => (
                              <span key={c.id} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-[10px] font-bold">
                                {c.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No classes assigned yet</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {editingStream?.id === st.id ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={handleUpdateStream}
                              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px]"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingStream(null)}
                              className="px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px]"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenAssignModal(st)}
                              className="px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100 font-bold text-[11px] transition cursor-pointer"
                              title="Assign or reassign classes to this stream"
                            >
                              Assign Classes
                            </button>
                            <button
                              onClick={() => setEditingStream(st)}
                              className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer"
                            >
                              Rename
                            </button>
                            <button
                              onClick={() => {
                                updateStream({
                                  ...st,
                                  is_active: !st.is_active,
                                });
                                showToast(`Stream ${st.name} status toggled!`, 'info');
                              }}
                              className="text-[11px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                            >
                              {st.is_active ? 'Disable' : 'Enable'}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Modal for Assigning Classes to an Existing Stream */}
          {assigningClassesStream && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
              <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Layers className="w-5 h-5 text-blue-600" />
                      Assign Classes to Stream: {assigningClassesStream.name}
                    </h3>
                    <span className="text-[11px] text-slate-500">
                      Configure which academic classes offer Stream {assigningClassesStream.name}
                    </span>
                  </div>
                  <button
                    onClick={() => setAssigningClassesStream(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-4 sm:p-6 space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      Select Classes: ({assignedClassIds.length} of {classes.length} selected)
                    </span>
                    <div className="flex items-center gap-2 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setAssignedClassIds(classes.map((c) => c.id))}
                        className="text-blue-600 hover:underline font-bold cursor-pointer"
                      >
                        Select All
                      </button>
                      <span className="text-slate-400">•</span>
                      <button
                        type="button"
                        onClick={() => setAssignedClassIds([])}
                        className="text-slate-500 hover:underline cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto p-1">
                    {classes.map((cls) => {
                      const isChecked = assignedClassIds.includes(cls.id);
                      return (
                        <label
                          key={cls.id}
                          className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition ${
                            isChecked
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-bold shadow-xs'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setAssignedClassIds([...assignedClassIds, cls.id]);
                              } else {
                                setAssignedClassIds(assignedClassIds.filter((id) => id !== cls.id));
                              }
                            }}
                            className="rounded text-blue-600"
                          />
                          <span>{cls.name} ({cls.level})</span>
                        </label>
                      );
                    })}
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setAssigningClassesStream(null)}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveAssignedClasses}
                      className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold shadow-md cursor-pointer transition"
                    >
                      Save Class Allocation
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SUPABASE CONFIG */}
      {activeTab === 'supabase' && (
        <form onSubmit={handleSaveSupabase} className="p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 space-y-1 leading-relaxed">
            <h4 className="font-bold flex items-center gap-1.5 text-xs">
              <Shield className="w-4 h-4 text-blue-600" />
              Supabase Authentication & Database Integration
            </h4>
            <p className="text-[11px]">
              EduCore is an offline-first system. Enter your <strong>Supabase URL</strong> and <strong>Publishable (Anon) Key</strong> to synchronize local records with your cloud PostgreSQL database.
            </p>
            <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-300">
              Security Notice: NEVER place your Supabase secret or service-role key in browser code or public settings. Row Level Security policies (configured in supabase/schema.sql) guarantee student and financial privacy.
            </p>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
              Supabase Project URL *
            </label>
            <input
              type="url"
              placeholder="https://your-project-id.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
              Supabase Publishable / Anon Public Key *
            </label>
            <textarea
              rows={3}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-xs"
            />
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                testResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold border border-slate-300 dark:border-slate-700 transition"
            >
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <span>{isTesting ? 'Testing Connection...' : 'Test Connection'}</span>
            </button>

            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold shadow-md transition"
            >
              <Save className="w-4 h-4" />
              <span>Save Supabase Configuration</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: BACKUP */}
      {activeTab === 'backup' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Data Safety & Local Storage Archival
            </h3>
            <p className="text-slate-500 mt-1 leading-relaxed">
              Export an encrypted full JSON dump containing all students, classes, attendance records, fees transactions in UGX, and examination marks stored on this device.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <strong className="text-slate-900 dark:text-white block">Download Full JSON School Archive</strong>
              <span className="text-[11px] text-slate-400">
                Safe to store on local flash drives or archival hard disks.
              </span>
            </div>
            <button
              onClick={handleExportFullBackup}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold shadow-xs transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Database JSON</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">User & Role</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Target Module</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3 text-slate-400 font-mono text-[10px]">
                    {new Date(log.timestamp).toLocaleString('en-UG')}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-slate-900 dark:text-white">{log.user_name}</span>
                    <span className="block text-[10px] text-blue-600">{log.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{log.table_name}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300 text-[11px]">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
