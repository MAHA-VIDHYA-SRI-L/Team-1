import React, { useState, useMemo } from 'react';
import { 
  Award, 
  BookOpen, 
  FileText, 
  Briefcase, 
  Plus, 
  Calendar, 
  MapPin, 
  Lock, 
  Unlock, 
  FileUp, 
  CheckCircle, 
  Clock, 
  Trash2,
  FolderPlus
} from 'lucide-react';

// --- Interfaces & Types ---
interface Certificate {
  id: string;
  title: string;
  issuingOrganization: string;
  category: string;
  startDate: string;
  endDate: string;
  fileName: string;
  status: 'Approved' | 'Pending Review';
  description?: string;
}

export default function Badges() {
  // --- Core State ---
  const [categories, setCategories] = useState<string[]>([
    'Hackathon',
    'Workshop',
    'Paper Presentation',
    'Internship'
  ]);
  
  const [activeTab, setActiveTab] = useState<string>('Hackathon');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isCustomCategoryModalOpen, setIsCustomCategoryModalOpen] = useState<boolean>(false);
  
  // Custom category input state
  const [newCategoryName, setNewCategoryName] = useState<string>('');

  // Initial mockup state for certificates data tracking
  const [certificates, setCertificates] = useState<Certificate[]>([
    {
      id: 'cert-1',
      title: 'Smart India Hackathon Internal Tier',
      issuingOrganization: 'K.S.R. College of Engineering',
      category: 'Hackathon',
      startDate: '2026-02-12',
      endDate: '2026-02-13',
      fileName: 'sih_internal_2026.pdf',
      status: 'Approved',
      description: 'Developed an automated water conservation platform tracking consumption matrices.'
    },
    {
      id: 'cert-2',
      title: 'LLM Workshop in Generative AI',
      issuingOrganization: 'VIT Vellore',
      category: 'Workshop',
      startDate: '2026-03-05',
      endDate: '2026-03-06',
      fileName: 'vit_llm_workshop.png',
      status: 'Pending Review',
      description: 'Hands-on training building RAG models and context pipelines using Python framework tools.'
    }
  ]);

  // --- Form Input States for Upload Modal ---
  const [formTitle, setFormTitle] = useState('');
  const [formOrg, setFormOrg] = useState('');
  const [formCategory, setFormCategory] = useState('Hackathon');
  const [formStart, setFormStart] = useState('');
  const [formEnd, setFormEnd] = useState('');
  const [formFile, setFormFile] = useState<File | null>(null);
  const [formDesc, setFormDesc] = useState('');
  const [formError, setFormError] = useState('');

  // --- Helper to Map Category Icons Dynamically ---
  const getCategoryIcon = (cat: string, className = "h-4 w-4") => {
    switch (cat) {
      case 'Hackathon': return <Award className={className} />;
      case 'Workshop': return <BookOpen className={className} />;
      case 'Paper Presentation': return <FileText className={className} />;
      case 'Internship': return <Briefcase className={className} />;
      default: return <Award className={className} />; 
    }
  };

  // --- Custom Bucket Generation Handler ---
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newCategoryName.trim();
    if (!cleanName) return;
    
    if (categories.map(c => c.toLowerCase()).includes(cleanName.toLowerCase())) {
      alert("This category already exists!");
      return;
    }

    setCategories([...categories, cleanName]);
    setActiveTab(cleanName);
    setNewCategoryName('');
    setIsCustomCategoryModalOpen(false);
  };

  // --- Core Certificate Upload Processor ---
  const handleCertificateUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formTitle.trim() || !formOrg.trim() || !formStart || !formEnd || !formFile) {
      setFormError('Please fulfill all mandatory fields, including the certificate soft copy file.');
      return;
    }

    const newCert: Certificate = {
      id: `cert-${Date.now()}`,
      title: formTitle,
      issuingOrganization: formOrg,
      category: formCategory,
      startDate: formStart,
      endDate: formEnd,
      fileName: formFile.name,
      status: 'Pending Review',
      description: formDesc
    };

    setCertificates([newCert, ...certificates]);
    setActiveTab(formCategory); 
    
    // Reset Form Fields
    setFormTitle(''); setFormOrg(''); setFormStart(''); setFormEnd(''); setFormFile(null); setFormDesc('');
    setIsModalOpen(false);
  };

  // --- Document Record Deletion ---
  const handleDeleteCertificate = (id: string) => {
    if (window.confirm("Are you sure you want to delete this certificate record submission?")) {
      setCertificates(certificates.filter(c => c.id !== id));
    }
  };

  // Filtered logs list
  const filteredCertificates = useMemo(() => {
    return certificates.filter(c => c.category === activeTab);
  }, [certificates, activeTab]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-8">
      
      {/* Top Welcome Title Grid Block */}
      <div className="max-w-6xl mx-auto bg-white border border-slate-100 p-6 rounded-[24px] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Badges & Scholastic Certificates</h1>
          <p className="text-[13px] text-slate-500 font-medium mt-0.5">Upload, store, and secure your verified achievements for profile validation.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCustomCategoryModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl text-[13px] font-bold tracking-wide hover:bg-slate-50 transition-all"
          >
            <FolderPlus className="h-4 w-4 text-slate-500" />
            Add Custom Bucket
          </button>
          
          <button
            onClick={() => { setFormCategory(activeTab); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#002D62] text-white rounded-xl text-[13px] font-bold tracking-wide hover:bg-[#001c3d] shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            Upload Certificate
          </button>
        </div>
      </div>

      {/* Main Grid Content Matrix */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* LEFT COLUMN: AVAILABLE BUCKET LIST */}
        <div className="lg:col-span-1 space-y-2">
          <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase px-3 block">Available Groups</span>
          <div className="space-y-1 bg-white border border-slate-100 p-2 rounded-[20px] shadow-sm">
            {categories.map((cat) => {
              const count = certificates.filter(c => c.category === cat).length;
              const isActive = activeTab === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[13px] font-bold tracking-wide transition-all ${
                    isActive 
                      ? 'bg-[#002D62]/10 text-[#002D62]' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <span className={isActive ? 'text-[#002D62]' : 'text-slate-400'}>
                      {getCategoryIcon(cat, "h-4 w-4 shrink-0 stroke-[2.5]")}
                    </span>
                    <span className="truncate">{cat}</span>
                  </div>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-black ${isActive ? 'bg-[#002D62] text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: CERTIFICATE GRID VIEW */}
        <div className="lg:col-span-3">
          {filteredCertificates.length === 0 ? (
            <div className="bg-white rounded-[24px] border border-dashed border-slate-200 p-12 text-center flex flex-col items-center justify-center shadow-sm">
              <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 mb-4">
                {getCategoryIcon(activeTab, "h-6 w-6 stroke-[2]")}
              </div>
              <h3 className="text-sm font-bold text-slate-700">No logs for "{activeTab}" yet</h3>
              <p className="text-xs text-slate-400 max-w-xs mt-1 mb-6">
                You haven't committed soft copies or data summaries to this profile segment container yet.
              </p>
              <button
                onClick={() => { setFormCategory(activeTab); setIsModalOpen(true); }}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition-all"
              >
                Add First Record
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCertificates.map((cert) => {
                const isApproved = cert.status === 'Approved';
                return (
                  <div 
                    key={cert.id} 
                    className={`bg-white rounded-[24px] border transition-all p-5 shadow-sm flex flex-col justify-between ${
                      isApproved ? 'border-emerald-100 bg-gradient-to-br from-white to-emerald-50/10' : 'border-slate-100'
                    }`}
                  >
                    <div>
                      {/* Badge Header Row */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <span className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                          isApproved ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {isApproved ? <CheckCircle className="h-3 w-3 stroke-[2.5]" /> : <Clock className="h-3 w-3 stroke-[2.5]" />}
                          {cert.status}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <span title={isApproved ? "Verified & Locked by Administration" : "Editable until review checklist pass"}>
                            {isApproved ? (
                              <Lock className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <Unlock className="h-3.5 w-3.5 text-slate-400" />
                            )}
                          </span>
                          {!isApproved && (
                            <button 
                              onClick={() => handleDeleteCertificate(cert.id)}
                              className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-50 transition-all"
                              title="Delete Submission"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Metadata Area */}
                      <h3 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2">{cert.title}</h3>
                      
                      <div className="mt-4 space-y-2 text-[12px] font-semibold text-slate-500">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate text-slate-600">{cert.issuingOrganization}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{cert.startDate} — {cert.endDate}</span>
                        </div>
                      </div>

                      {cert.description && (
                        <p className="text-[11px] font-medium text-slate-400 mt-4 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          {cert.description}
                        </p>
                      )}
                    </div>

                    {/* Footer Row */}
                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-400 truncate max-w-[130px] font-mono text-[10px] font-normal">{cert.fileName}</span>
                      <a 
                        href="#view-file" 
                        onClick={(e) => e.preventDefault()} 
                        className="text-[#002D62] hover:underline shrink-0"
                      >
                        View Attachment →
                      </a>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* --- MODAL 1: UPLOAD CERTIFICATE FORM MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] w-full max-w-md shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            
            <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-[14px] font-black text-slate-800 uppercase tracking-wide">Upload Certificate</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm font-medium">✕</button>
            </div>

            <form onSubmit={handleCertificateUpload} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-semibold">
                  ⚠️ {formError}
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Certificate / Event Title *</label>
                <input 
                  type="text" required placeholder="e.g. Smart India Hackathon 2026" value={formTitle} onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 text-sm rounded-xl focus:outline-none focus:border-[#002D62]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Assigned Group Category *</label>
                <select 
                  value={formCategory} onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 bg-white text-sm rounded-xl focus:outline-none"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Host College / Institution *</label>
                <input 
                  type="text" required placeholder="e.g. KSRCE / IIT Madras" value={formOrg} onChange={(e) => setFormOrg(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 text-sm rounded-xl focus:outline-none focus:border-[#002D62]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">From Date *</label>
                  <input 
                    type="date" required value={formStart} onChange={(e) => setFormStart(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 text-sm rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">To Date *</label>
                  <input 
                    type="date" required value={formEnd} onChange={(e) => setFormEnd(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 text-sm rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Summary Overview (Optional)</label>
                <textarea 
                  placeholder="Provide a brief summary of project milestones, rewards, or core tech stacks..." value={formDesc} onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 text-sm rounded-xl h-16 resize-none focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Upload Soft Copy Attachment *</label>
                <label className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-all">
                  <input 
                    type="file" accept=".pdf,.png,.jpg,.jpeg" required className="hidden" 
                    onChange={(e) => { if (e.target.files?.[0]) setFormFile(e.target.files[0]); }}
                  />
                  <FileUp className="h-5 w-5 text-slate-400 mb-1" />
                  <span className="text-xs font-bold text-slate-600 text-center truncate max-w-full px-2">
                    {formFile ? formFile.name : "Click to select local file"}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5 font-medium">Supports PDF, PNG, JPEG up to 5MB</span>
                </label>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button 
                  type="button" onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-[#002D62] text-white rounded-xl text-xs font-bold hover:bg-[#001c3d]"
                >
                  Save Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: ADD NEW CUSTOM CATEGORY BUCKET --- */}
      {isCustomCategoryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] w-full max-w-sm shadow-2xl border border-slate-100 p-5">
            
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-[13px] font-black text-slate-800 uppercase tracking-wide">Create Custom Category</h2>
              <button onClick={() => setIsCustomCategoryModalOpen(false)} className="text-slate-400 text-xs">✕</button>
            </div>

            <form onSubmit={handleAddCategory} className="pt-4 space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Category Group Name *</label>
                <input 
                  type="text" autoFocus required placeholder="e.g., Online Courses, NPTEL" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 text-sm rounded-xl focus:outline-none focus:border-[#002D62]"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button 
                  type="button" onClick={() => setIsCustomCategoryModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50"
                >
                  Dismiss
                </button>
                <button 
                  type="submit"
                  className="px-4 py-1.5 bg-[#002D62] text-white rounded-lg text-xs font-bold hover:bg-[#001c3d]"
                >
                  Create Bucket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}