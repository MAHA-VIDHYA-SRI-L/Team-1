import React, { useState, useMemo, useRef } from 'react';
import { 
  Award, 
  BookOpen, 
  FileText, 
  Briefcase, 
  Plus, 
  Calendar, 
  MapPin, 
  FileUp, 
  CheckCircle, 
  Clock, 
  Trash2,
  FolderPlus,
  ArrowLeft,
  UploadCloud,
  Edit2,
  FileCheck,
  Lock,
  Unlock,
  X,
  Download,
  AlertTriangle
} from 'lucide-react';

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

interface BadgesProps {
  onBackToDashboard?: () => void;
  user?: {
    fullName: string;
    department?: string;
    email?: string;
    phone?: string;
    cgpa?: string;
  };
}

export default function Badges({ 
  onBackToDashboard, 
  user = { 
    fullName: 'Francis Fernando', 
    department: 'CSE',
    email: 'francis.fernando@ksrce.ac.in',
    phone: '+91 98765 43210',
    cgpa: '8.75'
  } 
}: BadgesProps) {
  
  const [categories, setCategories] = useState<string[]>([
    'Hackathon',
    'Workshop',
    'Paper Presentation',
    'Internship'
  ]);
  const [activeTab, setActiveTab] = useState<string>('Hackathon');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isCustomCategoryModalOpen, setIsCustomCategoryModalOpen] = useState<boolean>(false);
  
  // Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    actionType: 'delete_resume' | 'delete_cert';
    targetId?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    actionType: 'delete_resume'
  });

  // Custom category input state
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [editingCertId, setEditingCertId] = useState<string | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const [previewDocument, setPreviewDocument] = useState<{
    title: string;
    fileName: string;
    type: 'certificate' | 'resume';
    issuingOrganization?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    status?: 'Approved' | 'Pending Review';
  } | null>(null);

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [certsLoading, setCertsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadCerts = () =>
    fetchCertifications()
      .then(d => {
        const mapped = (d.certifications || []).map((c: any): Certificate => ({
          id: c.id,
          title: c.certification_name,
          issuingOrganization: c.issuer || '',
          category: c.category || 'General',
          startDate: c.start_date || '',
          endDate: c.end_date || '',
          fileName: c.certificate_url || '',
          status: c.status === 'Approved' ? 'Approved' : 'Pending Review',
          description: c.description || '',
        }));
        setCertificates(mapped);
        const extraCats = [...new Set(mapped.map((c: Certificate) => c.category))]
          .filter((cat: string) => !['Hackathon','Workshop','Paper Presentation','Internship'].includes(cat));
        if (extraCats.length) setCategories(prev => [...new Set([...prev, ...extraCats])]);
      })
      .catch(() => {})
      .finally(() => setCertsLoading(false));

  useEffect(() => {
    loadCerts();
    fetchResume().then(d => { if (d?.resume?.resume_url) setResumeUrl(d.resume.resume_url); }).catch(() => {});
  }, []);

  const [formTitle, setFormTitle] = useState('');
  const [formOrg, setFormOrg] = useState('');
  const [formCategory, setFormCategory] = useState('Hackathon');
  const [formStart, setFormStart] = useState('');
  const [formEnd, setFormEnd] = useState('');
  const [formFile, setFormFile] = useState<File | null>(null);
  const [formFileName, setFormFileName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formError, setFormError] = useState('');

  const getCategoryIcon = (cat: string, className = "h-4 w-4") => {
    switch (cat) {
      case 'Hackathon': return <Award className={className} />;
      case 'Workshop': return <BookOpen className={className} />;
      case 'Paper Presentation': return <FileText className={className} />;
      case 'Internship': return <Briefcase className={className} />;
      default: return <Award className={className} />; 
    }
  };

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

  const handleResumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
      setResumeUploaded(true);
    }
  };

  const handleDeleteResume = () => {
    if (window.confirm("Are you sure you want to delete your resume? This is a mandatory requirement.")) {
      setResumeUrl(null);
      if (resumeInputRef.current) resumeInputRef.current.value = '';
    }
    setConfirmModal({ isOpen: false, title: '', message: '', actionType: 'delete_resume' });
  };

  const handleOpenPreview = (cert: Certificate) => {
    setPreviewDocument({
      title: cert.title,
      fileName: cert.fileName,
      type: 'certificate',
      issuingOrganization: cert.issuingOrganization,
      startDate: cert.startDate,
      endDate: cert.endDate,
      description: cert.description,
      status: cert.status
    });
  };

  const closeFormModal = () => {
    setEditingCertId(null);
    setFormTitle('');
    setFormOrg('');
    setFormStart('');
    setFormEnd('');
    setFormFile(null);
    setFormFileName('');
    setFormDesc('');
    setFormError('');
    setIsModalOpen(false);
  };

  const handleCertificateUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formTitle.trim() || !formOrg.trim() || !formStart || !formEnd) {
      setFormError('Please fulfill all mandatory text fields.');
      return;
    }

    if (!editingCertId && !formFile && !formFileName) {
      setFormError('Please upload the certificate soft copy file.');
      return;
    }

    const finalFileName = formFile ? formFile.name : (formFileName || 'uploaded_doc.pdf');

    if (editingCertId) {
      setCertificates(prev => prev.map(c => {
        if (c.id === editingCertId) {
          return {
            ...c,
            title: formTitle,
            issuingOrganization: formOrg,
            category: formCategory,
            startDate: formStart,
            endDate: formEnd,
            fileName: finalFileName,
            status: 'Pending Review',
            description: formDesc
          };
        }
        return c;
      }));
    } else {
      const newCert: Certificate = {
        id: `cert-${Date.now()}`,
        title: formTitle,
        issuingOrganization: formOrg,
        category: formCategory,
        startDate: formStart,
        endDate: formEnd,
        fileName: finalFileName,
        status: 'Pending Review',
        description: formDesc
      };
      setCertificates([newCert, ...certificates]);
      setActiveTab(formCategory); 
    }
    closeFormModal();
  };

  const handleDeleteCertificate = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this certificate record?')) return;
    try {
      await removeCertification(id);
      setCertificates(prev => prev.filter(c => c.id !== id));
    } catch {}
  };

  const handleEditOpen = (cert: Certificate) => {
    if (cert.status === 'Approved') {
      const confirmEdit = window.confirm("This certificate is already APPROVED by staff. Editing its parameters will reset its status to 'Pending Review'. Proceed?");
      if (!confirmEdit) return;
    }
    setEditingCertId(cert.id);
    setFormTitle(cert.title);
    setFormOrg(cert.issuingOrganization);
    setFormCategory(cert.category);
    setFormStart(cert.startDate);
    setFormEnd(cert.endDate);
    setFormDesc(cert.description || '');
    setFormFileName(cert.fileName);
    setIsModalOpen(true);
  };

  const filteredCertificates = useMemo(() => certificates.filter(c => c.category === activeTab), [certificates, activeTab]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-800">
      
      <aside className="w-64 bg-[#002D62] text-white flex flex-col justify-between shrink-0 hidden md:flex h-screen sticky top-0 shadow-2xl">
        <div className="p-5 space-y-6 overflow-y-auto flex-1">
          <div className="border-b border-white/10 pb-4">
            <h1 className="text-xl font-black tracking-wider uppercase">Placemate</h1>
            <p className="text-[10px] font-bold text-blue-300/80 tracking-widest uppercase mt-0.5">Credentials Hub</p>
          </div>

          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10 shadow-sm">
            <div className="h-10 w-10 rounded-full bg-orange-500 text-white font-black text-sm flex items-center justify-center ring-2 ring-white/10 shrink-0">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="text-left truncate">
              <p className="text-xs font-black leading-none truncate">{user.fullName}</p>
              <p className="text-[9px] font-bold text-slate-300 mt-1 uppercase tracking-wider">{user.department} Department</p>
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase px-2 block mb-1">Category Buckets</span>
            {categories.map((cat) => {
              const count = certificates.filter(c => c.category === cat).length;
              const isActive = activeTab === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-[12px] font-bold tracking-wide transition-all ${
                    isActive 
                      ? 'bg-white/10 text-white border border-white/10 shadow-inner' 
                      : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className={isActive ? 'text-white' : 'text-slate-400'}>
                      {getCategoryIcon(cat, "h-4 w-4 shrink-0 stroke-[2.5]")}
                    </span>
                    <span className="truncate">{cat}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                    isActive ? 'bg-orange-500 text-white' : 'bg-white/10 text-slate-300'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-white/10">
            <button
              onClick={() => setIsCustomCategoryModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs font-bold transition-all text-slate-300 hover:text-white"
            >
              <FolderPlus className="h-4 w-4 text-slate-300" />
              <span>Add Custom Category</span>
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-white/10 bg-[#00224D]">
          {onBackToDashboard && (
            <button 
              onClick={onBackToDashboard}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-white text-[#002D62] hover:bg-blue-50 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-[0.98]"
            >
              <ArrowLeft className="h-4 w-4 stroke-[2.5]" />
              <span>Back to Dashboard</span>
            </button>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm shrink-0">
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight leading-none">Badges & Scholastic Certificates</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Upload and secure your credentials</p>
          </div>

          <button
            onClick={() => { setFormCategory(activeTab); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#002D62] text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[#001c3d] shadow-md transition-all active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Upload Certificate
          </button>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto space-y-6">
          
          <div className={`p-6 rounded-[24px] border transition-all ${
            resumeUploaded 
              ? 'bg-emerald-50/50 border-emerald-500/20 shadow-sm' 
              : 'bg-gradient-to-r from-red-50/60 to-orange-50/60 border-orange-200 shadow-md'
          }`}>
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className={`p-4 rounded-2xl shrink-0 ${resumeUploaded ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                  <FileCheck className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-black text-slate-800 tracking-tight">Compulsory Placement Resume</h2>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                      resumeUploaded ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white animate-pulse'
                    }`}>
                      {resumeUploaded ? 'Uploaded & Verified' : 'COMPULSORY REQUIREMENT'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 max-w-2xl font-medium leading-relaxed">
                    To participate in campus recruitment drives, it is mandatory to upload your master resume. The placement officer will review this document to compute your overall Readiness Index score.
                  </p>
                </div>
              </div>

              {/* Dynamic Interactive Action Suite based on upload status */}
              <div className="w-full lg:w-auto shrink-0 flex flex-col sm:flex-row items-center gap-2">
                <input type="file" ref={resumeInputRef} onChange={handleResumeChange} accept=".pdf" className="hidden" />
                
                {resumeUploaded ? (
                  <>
                    <button
                      onClick={handleOpenResumePreview}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-[#002D62] text-white hover:bg-[#001c3d] rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm"
                    >
                      View Resume
                    </button>
                    <button
                      onClick={() => resumeInputRef.current?.click()}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm"
                    >
                      Replace (PDF)
                    </button>
                    <button
                      onClick={triggerResumeDeleteConfirm}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all shadow-sm border border-red-100"
                      title="Delete Resume"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => resumeInputRef.current?.click()}
                    className="w-full lg:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 bg-orange-500 text-white hover:bg-orange-600 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-[0.98]"
                  >
                    <UploadCloud className="h-4.5 w-4.5" />
                    Upload Mandatory Resume
                  </button>
                )}
              </div>
            </div>

            {resumeUploaded && (
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></div>
                  <span>Attached: <span className="font-mono font-medium text-[#002D62]">{resumeFile ? resumeFile.name : 'francis_resume_verified.pdf'}</span></span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wide">Last Updated: Just Now</span>
              </div>
            )}
          </div>

          <div>
            {filteredCertificates.length === 0 ? (
              <div className="bg-white rounded-[24px] border border-dashed border-slate-200 p-12 text-center flex flex-col items-center justify-center shadow-sm">
                <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 mb-4">
                  {getCategoryIcon(activeTab, "h-8 w-8 stroke-[1.5]")}
                </div>
                <h3 className="text-sm font-bold text-slate-700">No records for "{activeTab}" yet</h3>
                <p className="text-xs text-slate-400 max-w-xs mt-1 mb-6">
                  You haven't uploaded soft copies or data logs to this category block yet.
                </p>
                <button
                  onClick={() => { setFormCategory(activeTab); setIsModalOpen(true); }}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
                >
                  Upload First Attachment
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCertificates.map((cert) => {
                  const isApproved = cert.status === 'Approved';
                  return (
                    <div 
                      key={cert.id} 
                      className={`bg-white rounded-[24px] border transition-all overflow-hidden flex flex-col shadow-sm group hover:shadow-md ${
                        isApproved ? 'border-emerald-100' : 'border-slate-200'
                      }`}
                    >
                      <div className="h-40 bg-slate-100 relative flex items-center justify-center border-b border-slate-100 overflow-hidden">
                        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#002d62_1px,transparent_1px)] [background-size:12px_12px]"></div>
                        
                        <div className="w-[85%] h-[80%] bg-white rounded-lg border border-slate-200 shadow-sm p-4 relative flex flex-col justify-between select-none">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="h-1.5 w-16 bg-slate-300 rounded"></div>
                              <div className="h-1 w-24 bg-slate-200 rounded"></div>
                            </div>
                            <div className="h-6 w-6 rounded-full border-2 border-[#002D62]/10 flex items-center justify-center">
                              {getCategoryIcon(cert.category, "h-3.5 w-3.5 text-[#002D62]")}
                            </div>
                          </div>
                          
                          <div className="flex items-end justify-between">
                            <div className="space-y-1">
                              <div className="h-1 w-12 bg-slate-200 rounded"></div>
                              <div className="h-0.5 w-16 bg-slate-100 rounded"></div>
                            </div>
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-[6px] font-black uppercase rotate-[-12deg] border border-dashed ${
                              isApproved ? 'border-emerald-500/40 text-emerald-600 bg-emerald-50/50' : 'border-amber-500/40 text-amber-600 bg-amber-50/50'
                            }`}>
                              {isApproved ? 'VERIFIED' : 'PENDING'}
                            </div>
                          </div>
                        </div>

                        <div className="absolute top-3 left-3">
                          <span className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                            isApproved ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                          }`}>
                            {isApproved ? <CheckCircle className="h-2.5 w-2.5" /> : <Clock className="h-2.5 w-2.5" />}
                            {cert.status}
                          </span>
                        </div>

                        <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditOpen(cert)}
                            className="p-1.5 bg-white hover:bg-slate-50 text-[#002D62] rounded-lg shadow border border-slate-200 transition-all"
                            title="Edit Submission"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          
                          <button 
                            onClick={() => triggerCertificateDeleteConfirm(cert.id)}
                            className="p-1.5 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg shadow border border-slate-200 transition-all"
                            title="Delete Submission"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <h3 className="font-bold text-slate-800 text-sm leading-snug line-clamp-1" title={cert.title}>
                            {cert.title}
                          </h3>
                          
                          <div className="space-y-1 text-[11px] font-bold text-slate-500">
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
                            <p className="text-[11px] font-medium text-slate-400 leading-relaxed line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                              {cert.description}
                            </p>
                          )}
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                          <div className="flex items-center gap-1.5 text-slate-400 max-w-[130px] truncate">
                            <FileText className="h-3.5 w-3.5 text-slate-400" />
                            <span className="font-mono text-[10px] font-normal truncate">{cert.fileName}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            {/* Verification lock stamp indicator */}
                            <span className="flex items-center" title={isApproved ? "Verified & Locked by Staff" : "Editable until staff checklist verification"}>
                              {isApproved ? (
                                <Lock className="h-3.5 w-3.5 text-emerald-600" />
                              ) : (
                                <Unlock className="h-3.5 w-3.5 text-slate-400" />
                              )}
                            </span>
                            <button 
                              onClick={() => handleOpenPreview(cert)} 
                              className="text-[#002D62] hover:underline shrink-0"
                            >
                              View Document →
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </main>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] w-full max-w-md shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            
            <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-[14px] font-black text-slate-800 uppercase tracking-wide">
                {editingCertId ? 'Edit Scholastic Record' : 'Upload Certificate'}
              </h2>
              <button onClick={closeFormModal} className="text-slate-400 hover:text-slate-600 text-sm font-medium">✕</button>
            </div>

            <form onSubmit={handleCertificateUpload} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-semibold flex items-start gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-red-500" />
                  <span>{formError}</span>
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
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                  {editingCertId ? 'Replace Attachment File (Optional)' : 'Upload Soft Copy Attachment *'}
                </label>
                <label className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-all">
                  <input 
                    type="file" accept=".pdf,.png,.jpg,.jpeg" required={!editingCertId && !formFileName} className="hidden" 
                    onChange={(e) => { if (e.target.files?.[0]) setFormFile(e.target.files[0]); }}
                  />
                  <FileUp className="h-5 w-5 text-slate-400 mb-1" />
                  <span className="text-xs font-bold text-slate-600 text-center truncate max-w-full px-2">
                    {formFile ? formFile.name : (formFileName ? `Retained: ${formFileName}` : "Click to select local file")}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5 font-medium">Supports PDF, PNG, JPEG up to 5MB</span>
                </label>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button 
                  type="button" onClick={closeFormModal}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all bg-white"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-[#002D62] text-white rounded-xl text-xs font-bold hover:bg-[#001c3d] transition-all"
                >
                  {editingCertId ? 'Update Record' : 'Save Certificate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

      {previewDocument && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] w-full max-w-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-[#002D62]" />
                <div>
                  <h3 className="text-sm font-black text-[#002D62] uppercase tracking-wide">Document Viewer Workspace</h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5 truncate max-w-xs sm:max-w-md">{previewDocument.fileName}</p>
                </div>
              </div>
              <button 
                onClick={() => setPreviewDocument(null)} 
                className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-100/50 flex flex-col items-center">
              
              <div className="w-full max-w-xl aspect-[1.414/1] bg-white rounded-2xl shadow-md border-4 border-slate-200/80 p-8 relative flex flex-col justify-between select-none overflow-hidden my-auto">
                <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#002d62_1.5px,transparent_1px)] [background-size:16px_12px]"></div>
                <div className="absolute inset-2 border border-slate-100 pointer-events-none"></div>

                <div className="text-center space-y-2 mt-4 relative z-10">
                  <h2 className="text-[#002D62] text-[10px] font-black uppercase tracking-widest leading-none">
                    K.S.R. College of Engineering
                  </h2>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">
                    Verification Ledger & Student Credentials Portal
                  </p>
                  <div className="w-24 h-[1px] bg-slate-200 mx-auto mt-2"></div>
                </div>

                  <div className="space-y-1.5">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#002D62] border-b border-slate-100 pb-1">Professional Summary</h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      Motivated undergraduate engineer from K.S.R. College of Engineering pursuing academic aggregates in technology tracks. Strong foundations in analytical modeling, system workflows, and programmatic solutions.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <h3 className="text-xs font-black uppercase tracking-wider text-[#002D62] border-b border-slate-100 pb-1">Education</h3>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-800">K.S.R. College of Engineering</p>
                        <p className="text-[11px] font-medium text-slate-500">B.E. Computer Science — CGPA: {user.cgpa || '8.75'} / 10</p>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-xs font-black uppercase tracking-wider text-[#002D62] border-b border-slate-100 pb-1">Verified Credentials</h3>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-800">Scholastic Records Aggregate</p>
                        <p className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Fully Verified by College Portal
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#002D62] border-b border-slate-100 pb-1">Academic Projects</h3>
                    {certificates.length > 0 ? (
                      <div className="space-y-2">
                        {certificates.map((c, i) => (
                          <div key={i} className="text-xs p-2 bg-slate-50 rounded-lg border border-slate-100">
                            <p className="font-bold text-slate-800">{c.title}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{c.issuingOrganization} | {c.startDate}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No certificates linked as projects yet.</p>
                    )}
                  </div>
                </div>
              ) : (
                /* CERTIFICATE LAYOUT CANVAS */
                <div className="w-full max-w-xl aspect-[1.414/1] bg-white rounded-2xl shadow-md border-4 border-slate-200/80 p-8 relative flex flex-col justify-between select-none overflow-hidden my-auto">
                  {/* Background grid watermark */}
                  <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#002d62_1.5px,transparent_1px)] [background-size:16px_12px]"></div>
                  {/* Decorative vintage border frame line */}
                  <div className="absolute inset-2 border border-slate-100 pointer-events-none"></div>

                  <div className="text-center space-y-2 mt-4 relative z-10">
                    <h2 className="text-[#002D62] text-[10px] font-black uppercase tracking-widest leading-none">
                      K.S.R. College of Engineering
                    </h2>
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">
                      Verification Ledger & Student Credentials Portal
                    </p>
                    <div className="w-24 h-[1px] bg-slate-200 mx-auto mt-2"></div>
                  </div>

                <div className="flex items-end justify-between border-t border-slate-100 pt-4 relative z-10 text-[9px] font-bold text-slate-400">
                  <div className="text-left space-y-1">
                    <span className="block text-slate-600 truncate max-w-[150px]">{previewDocument.issuingOrganization || 'K.S.R. College'}</span>
                    <span className="block text-[8px] font-semibold text-slate-400">ISSUING INSTITUTION</span>
                  </div>

                  {/* Footer Signatures */}
                  <div className="flex items-end justify-between border-t border-slate-100 pt-4 relative z-10 text-[9px] font-bold text-slate-400">
                    <div className="text-left space-y-1">
                      <span className="block text-slate-600 truncate max-w-[150px]">{previewDocument.issuingOrganization || 'K.S.R. College'}</span>
                      <span className="block text-[8px] font-semibold text-slate-400">ISSUING INSTITUTION</span>
                    </div>
                    
                    {previewDocument.startDate && (
                      <div className="text-center space-y-1">
                        <span className="block text-slate-600">{previewDocument.startDate}</span>
                        <span className="block text-[8px] font-semibold text-slate-400 font-mono">SUBMISSION DATE</span>
                      </div>
                    )}

                    <div className="text-right space-y-1">
                      <span className={`block px-2 py-0.5 rounded text-[8px] ${
                        previewDocument.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {previewDocument.status || 'Verified'}
                      </span>
                      <span className="block text-[8px] font-semibold text-slate-400">VERIFICATION MATRIX</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="w-full max-w-xl bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm text-xs font-semibold text-slate-600 space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Document Summary Description</p>
                <p className="text-slate-500 font-medium leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {previewDocument.description || 'No descriptive summary was logged for this scholastic record submission. File name stored in verified storage matrix.'}
                </p>
              </div>

            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button 
                onClick={() => setPreviewDocument(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all bg-white"
              >
                Close Viewer
              </button>
              <button 
                onClick={() => alert(`Simulated Download Completed: ${previewDocument.fileName}`)}
                className="px-4 py-2 bg-[#002D62] text-white rounded-xl text-xs font-bold hover:bg-[#001c3d] transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Download className="h-3.5 w-3.5" />
                Download Attachment
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}