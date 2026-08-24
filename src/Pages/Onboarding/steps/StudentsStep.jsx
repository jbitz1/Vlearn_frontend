import React, { useState, useMemo } from 'react';
import { Card, Button, FileUploader } from '../../../Components/ui';
import { Download, Upload, Plus, Trash2 } from 'lucide-react';
import apiClient from '../../../config/apiClient';

const StudentsStep = ({ data = {}, updateData, formsAndStreams = {} }) => {
  const formsList = formsAndStreams.forms || Object.keys(formsAndStreams.streams || formsAndStreams);
  const streamsMap = formsAndStreams.streams || formsAndStreams;

  const [selectedForm, setSelectedForm] = useState(formsList[0] || '');
  const [selectedStream, setSelectedStream] = useState(
    streamsMap[formsList[0]]?.[0] || ''
  );
  
  const [showUpload, setShowUpload] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [newStudent, setNewStudent] = useState({ admNo: '', name: '' });

  // Update selected stream when form changes
  const handleFormChange = (form) => {
    setSelectedForm(form);
    setSelectedStream(streamsMap[form]?.[0] || '');
  };

  const streamId = `${selectedForm}-${selectedStream}`;
  const currentStudents = data[streamId] || [];

  const handleAddStudent = () => {
    if (newStudent.admNo && newStudent.name) {
      updateData({
        ...data,
        [streamId]: [...currentStudents, { ...newStudent, id: Date.now().toString() }]
      });
      setNewStudent({ admNo: '', name: '' });
      setShowAddForm(false);
    }
  };

  const removeStudent = (id) => {
    updateData({
      ...data,
      [streamId]: currentStudents.filter(s => s.id !== id)
    });
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await apiClient.get('/api/organizations/download-template/?type=student', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'student_upload_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to download student template', err);
      alert('Failed to download student Excel template.');
    }
  };

  const totalStudents = useMemo(() => {
    return Object.values(data).reduce((total, streamArr) => total + streamArr.length, 0);
  }, [data]);

  const hasStreams = formsList.length > 0 && 
                     formsList.some(form => (streamsMap[form] || []).length > 0);

  if (!hasStreams) {
    return (
      <div className="space-y-6 text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-white p-8">
        <h2 className="text-xl font-bold font-heading text-navy">Students Roster</h2>
        <p className="text-sm text-slate-500">Please add Forms and Streams in Step 4 before adding or importing students.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold font-heading text-navy">Students</h2>
          <p className="text-sm text-slate-500 mt-1">Add students to each stream. ({totalStudents} total students added)</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <select 
          className="rounded-xl border-slate-200 p-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white"
          value={selectedForm}
          onChange={(e) => handleFormChange(e.target.value)}
        >
          {formsList.map(form => (
            <option key={form} value={form}>{form}</option>
          ))}
        </select>
        
        <select 
          className="rounded-xl border-slate-200 p-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white"
          value={selectedStream}
          onChange={(e) => setSelectedStream(e.target.value)}
          disabled={!(streamsMap[selectedForm] || []).length}
        >
          {(streamsMap[selectedForm] || []).map(stream => (
            <option key={stream} value={stream}>{stream}</option>
          ))}
          {!(streamsMap[selectedForm] || []).length && (
            <option value="">No streams available</option>
          )}
        </select>
      </div>

      {selectedStream ? (
        <Card className="border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-navy font-heading">
              Adding students to {selectedForm} {selectedStream}
              <span className="ml-2 text-xs font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                {currentStudents.length} students
              </span>
            </h3>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => { setShowUpload(!showUpload); setShowAddForm(false); }} size="sm" className="text-xs h-8">
                <Upload size={14} className="mr-1.5" /> Upload
              </Button>
              <Button onClick={() => { setShowAddForm(!showAddForm); setShowUpload(false); }} size="sm" className="text-xs h-8">
                <Plus size={14} className="mr-1.5" /> Add Student
              </Button>
            </div>
          </div>

          {showUpload && (
            <div className="mb-6 p-4 rounded-xl bg-primary-light/30 border border-primary/20">
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-slate-600">Upload Excel/CSV file with Admission No. and Name</p>
                <button 
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                >
                  <Download size={14} /> Download Template
                </button>
              </div>
              <FileUploader 
                accept=".csv,.xlsx" 
                onFileSelect={(file) => console.log('File selected:', file)}
              />
            </div>
          )}

          {showAddForm && (
            <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Admission No. *</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border-slate-200 p-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                    value={newStudent.admNo}
                    onChange={(e) => setNewStudent({...newStudent, admNo: e.target.value})}
                  />
                </div>
                <div className="flex-[2]">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Student Name *</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border-slate-200 p-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddStudent()}
                  />
                </div>
                <Button onClick={handleAddStudent} disabled={!newStudent.admNo || !newStudent.name}>
                  Save
                </Button>
              </div>
            </div>
          )}

          {currentStudents.length > 0 ? (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="w-12 px-4 py-3 text-center text-xs font-semibold text-slate-500">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Admission No.</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Name</th>
                    <th className="w-20 px-4 py-3 text-right text-xs font-semibold text-slate-500">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentStudents.map((student, idx) => (
                    <tr key={student.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-center text-slate-400">{idx + 1}</td>
                      <td className="px-4 py-3 font-medium text-navy">{student.admNo}</td>
                      <td className="px-4 py-3 text-slate-700">{student.name}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => removeStudent(student.id)} className="text-slate-400 hover:text-danger">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 border border-dashed border-slate-200 rounded-xl">
              <p>No students added to this stream yet.</p>
            </div>
          )}
        </Card>
      ) : (
        <Card className="text-center py-12 text-slate-500">
          Please add and select a stream to begin adding students.
        </Card>
      )}
    </div>
  );
};

export default StudentsStep;
