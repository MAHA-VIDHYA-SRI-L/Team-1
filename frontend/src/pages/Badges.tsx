import React, { useState, useMemo, useEffect } from 'react';
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
  Edit2,
  FileCheck,
  Lock,
  Unlock,
  X,
  Download,
  AlertTriangle,
  Upload,
  Loader2
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import logoUrl from '../assets/logo.jpg';
import ThemeToggle from '../components/ThemeToggle';
import {
  fetchCertifications,
  addCertification,
  editCertification,
  removeCertification,
  uploadCertificateFile,
} from '../services/api';

interface Certificate {
  id: string;
  title: string;
  issuingOrganization: string;
  category: string;
  startDate: string;
  endDate: string;
  fileName: string;
  certificateUrl?: string;
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
  
  const { addToast } = useToast();
  
  const [categories, setCategories] = useState<string[]>([
    'Hackathon',
    'Workshop',
    'Paper Presentation',
    'Internship',
    'Other'
  ]);
  const [uploadingFile, setUploadingFile] = useState(false);
  
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

  // Editing state
  const [editingCertId, setEditingCertId] = useState<string | null>(null);

  // Resume State (Compulsory)
  

  // Preview Drawer Modal state
  const [previewDocument, setPreviewDocument] = useState<{
    title: string;
    fileName: string;
    certificateUrl?: string;
    type: 'certificate' | 'resume';
    issuingOrganization?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    status?: 'Approved' | 'Pending Review';
  } | null>(null);

  const [certificates, setCertificates] = useState<Certificate[]>([]);

  useEffect(() => {
    fetchCertifications()
      .then((res) => {
        const raw = Array.isArray(res) ? res : res?.certifications ?? [];
        const mapped: Certificate[] = raw.map((c: any) => ({
          id: c.id,
          title: c.certification_name,
          issuingOrganization: c.issuer,
          category: c.category || 'Hackathon',
          startDate: c.start_date || '',
          endDate: c.end_date || '',
          fileName: c.certificate_url ? c.certificate_url.split('/').pop() : '',
          certificateUrl: c.certificate_url || '',
          status: (c.status === 'Approved' ? 'Approved' : 'Pending Review') as 'Approved' | 'Pending Review',
          description: c.description || '',
        }));
        setCertificates(mapped);
        // auto-add any new categories from DB that aren't in the default list
        const dbCats = [...new Set(mapped.map(c => c.category))];
        setCategories(prev => {
          const merged = [...prev];
          dbCats.forEach(cat => { if (!merged.includes(cat)) merged.push(cat); });
          return merged;
        });
      })
      .catch(() => {});
  }, []);

  // --- Form Input States for Upload / Edit Modal ---
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
      addToast("This category already exists!", "error");
      return;
    }

    setCategories([...categories, cleanName]);
    setActiveTab(cleanName);
    setNewCategoryName('');
    setIsCustomCategoryModalOpen(false);
    addToast(`Category "${cleanName}" created successfully!`, "success");
  };

  

  const triggerCertificateDeleteConfirm = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Certificate?',
      message: 'Are you sure you want to delete this certificate record submission permanently? This action cannot be undone.',
      actionType: 'delete_cert',
      targetId: id
    });
  };

  const executeConfirmAction = async () => {
    if (confirmModal.actionType === 'delete_cert' && confirmModal.targetId) {
      try {
        await removeCertification(confirmModal.targetId);
        setCertificates(certificates.filter(c => c.id !== confirmModal.targetId));
        addToast('Certificate deleted successfully.', 'info');
      } catch {
        addToast('Failed to delete certificate.', 'error');
      }
    }
    setConfirmModal({ isOpen: false, title: '', message: '', actionType: 'delete_cert' });
  };

  const handleOpenPreview = (cert: Certificate) => {
    setPreviewDocument({
      title: cert.title,
      fileName: cert.fileName,
      certificateUrl: cert.certificateUrl,
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
    if (formEnd < formStart) {
      setFormError('End date cannot be before start date.');
      return;
    }
    if (!editingCertId && !formFile && !formFileName) {
      setFormError('Please upload the certificate soft copy file.');
      return;
    }

    try {
      let fileUrl = formFileName;
      let fileName = formFileName;

      // Upload file to storage if a new file was selected
      if (formFile) {
        setUploadingFile(true);
        try {
          fileUrl = await uploadCertificateFile(formFile);
          fileName = formFile.name;
        } finally {
          setUploadingFile(false);
        }
      }

      const body: Record<string, string> = {
        certification_name: formTitle,
        issuer: formOrg,
        category: formCategory,
        start_date: formStart,
        end_date: formEnd,
        description: formDesc,
        certificate_url: fileUrl || '',
      };

      if (editingCertId) {
        await editCertification(editingCertId, body);
        setCertificates(prev => prev.map(c => c.id === editingCertId ? {
          ...c,
          title: formTitle,
          issuingOrganization: formOrg,
          category: formCategory,
          startDate: formStart,
          endDate: formEnd,
          fileName: fileName || c.fileName,
          certificateUrl: fileUrl || c.certificateUrl,
          status: 'Pending Review',
          description: formDesc,
        } : c));
        addToast('Record updated successfully.', 'success');
      } else {
        const res = await addCertification(body);
        const newCert: Certificate = {
          id: res.id || `cert-${Date.now()}`,
          title: formTitle,
          issuingOrganization: formOrg,
          category: formCategory,
          startDate: formStart,
          endDate: formEnd,
          fileName: fileName || '',
          certificateUrl: fileUrl || '',
          status: 'Pending Review',
          description: formDesc,
        };
        setCertificates(prev => [newCert, ...prev]);
        setActiveTab(formCategory);
        addToast('Certificate uploaded successfully! 🎉', 'success');
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to save certificate.');
      return;
    }
    closeFormModal();
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

  const filteredCertificates = useMemo(() => {
    return certificates.filter(c => c.category === activeTab);
  }, [certificates, activeTab]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex font-sans text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      <aside className="w-64 bg-[#002D62] dark:bg-slate-900 text-white flex flex-col justify-between shrink-0 hidden md:flex h-screen sticky top-0 shadow-2xl border-r border-transparent dark:border-slate-800">
        <div className="p-5 space-y-6 overflow-y-auto flex-1">
          <div className="border-b border-white/10 dark:border-slate-800 pb-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shrink-0 overflow-hidden ring-2 ring-white/20">
              <img src={logoUrl} alt="Placemate Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-wider uppercase">Placemate</h1>
              <p className="text-[10px] font-bold text-blue-300/80 dark:text-blue-400/80 tracking-widest uppercase mt-0.5">Credentials Hub</p>
            </div>
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

        {/* SIDEBAR FOOTER ACTION: Back to Dashboard workspace securely pinned at the very bottom of the sidebar */}
        <div className="p-4 border-t border-white/10 bg-[#00224D]">
          {onBackToDashboard && (
            <button 
              onClick={onBackToDashboard}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg active:scale-[0.98]"
            >
              <ArrowLeft className="h-4 w-4 stroke-[2.5]" />
              <span>Back to Dashboard</span>
            </button>
          )}
        </div>
      </aside>

      {/* 2. MAIN ACTIVE WINDOW AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* Top Header */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm shrink-0 transition-colors duration-300">
          <div>
            <h1 className="text-lg font-black text-slate-800 dark:text-white tracking-tight leading-none">Badges & Scholastic Certificates</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Upload and secure your credentials</p>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => { setFormCategory(activeTab); setIsModalOpen(true); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#002D62] dark:bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[#001c3d] dark:hover:bg-blue-700 shadow-md transition-all active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              Upload Certificate
            </button>
          </div>
        </header>

        {}
        <main className="p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto space-y-6">
          
          {/* Resume upload removed: handled from Dashboard/Resume area to keep Badges focused on certificates */}

          {}
          <div>
            {filteredCertificates.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center shadow-sm transition-colors duration-300">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-full text-blue-500 mb-6 animate-pulse">
                  {getCategoryIcon(activeTab, "h-10 w-10 stroke-[2]")}
                </div>
                <h3 className="text-lg font-black text-slate-800 dark:text-white">Start Building Your "{activeTab}" Portfolio</h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-sm mt-2 mb-8">
                  Upload your certificates, achievement badges, and event proofs here. Our AI will analyze them for your placement readiness report.
                </p>
                <button
                  onClick={() => { setFormCategory(activeTab); setIsModalOpen(true); }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-[#002D62] text-white font-bold text-sm rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" /> Upload First Achievement
                </button>
              </div>
            ) : (
              // Visual Gallery Display
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCertificates.map((cert) => {
                  const isApproved = cert.status === 'Approved';
                  return (
                    <div 
                      key={cert.id} 
                      className={`bg-white dark:bg-slate-900 rounded-[24px] border transition-all duration-300 overflow-hidden flex flex-col shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 group ${
                        isApproved ? 'border-emerald-100 dark:border-emerald-900/50 hover:border-emerald-300 dark:hover:border-emerald-700' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {/* Visual paper-miniature preview thumbnail wrapper */}
                      <div className="h-40 bg-slate-100 dark:bg-slate-800/60 relative flex items-center justify-center border-b border-slate-100 dark:border-slate-800 overflow-hidden">
                        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#002d62_1px,transparent_1px)] [background-size:12px_12px]"></div>
                        
                        <div className="w-[85%] h-[80%] bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-4 relative flex flex-col justify-between select-none">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="h-1.5 w-16 bg-slate-300 dark:bg-slate-700 rounded"></div>
                              <div className="h-1 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
                            </div>
                            <div className="h-6 w-6 rounded-full border-2 border-[#002D62]/10 dark:border-blue-400/20 flex items-center justify-center">
                              {getCategoryIcon(cert.category, "h-3.5 w-3.5 text-[#002D62] dark:text-blue-400")}
                            </div>
                          </div>
                          
                          <div className="flex items-end justify-between">
                            <div className="space-y-1">
                              <div className="h-1 w-12 bg-slate-200 dark:bg-slate-800 rounded"></div>
                              <div className="h-0.5 w-16 bg-slate-100 dark:bg-slate-800/50 rounded"></div>
                            </div>
                            {/* Verification stamp watermark overlay */}
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-[6px] font-black uppercase rotate-[-12deg] border border-dashed ${
                              isApproved ? 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/40' : 'border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/40'
                            }`}>
                              {isApproved ? 'VERIFIED' : 'PENDING'}
                            </div>
                          </div>
                        </div>

                        {/* Top corner status capsule overlay */}
                        <div className="absolute top-3 left-3">
                          <span className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                            isApproved ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                          }`}>
                            {isApproved ? <CheckCircle className="h-2.5 w-2.5" /> : <Clock className="h-2.5 w-2.5" />}
                            {cert.status}
                          </span>
                        </div>

                        {/* Actions overlay panel shown upon hovering certificate thumbnail */}
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditOpen(cert)}
                            className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-[#002D62] dark:text-blue-400 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 transition-all hover:scale-110"
                            title="Edit Submission"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          
                          <button 
                            onClick={() => triggerCertificateDeleteConfirm(cert.id)}
                            className="p-2 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/50 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 transition-all hover:scale-110"
                            title="Delete Submission"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Details block positioned neatly below preview layer */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <h3 className="font-bold text-slate-800 dark:text-white text-sm leading-snug line-clamp-1" title={cert.title}>
                            {cert.title}
                          </h3>
                          
                          <div className="space-y-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span className="truncate text-slate-600 dark:text-slate-300">{cert.issuingOrganization}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span>{cert.startDate} — {cert.endDate}</span>
                            </div>
                          </div>

                          {cert.description && (
                            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-400 leading-relaxed line-clamp-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                              {cert.description}
                            </p>
                          )}
                        </div>

                        {/* File Details footer row inside gallery card with edit actions & verification lock states */}
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold">
                          <div className="flex items-center gap-1.5 text-slate-400 max-w-[130px] truncate">
                            <FileText className="h-3.5 w-3.5 text-slate-400" />
                            <span className="font-mono text-[10px] font-normal truncate">{cert.fileName}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            {/* Verification lock stamp indicator */}
                            <span className="flex items-center" title={isApproved ? "Verified & Locked by Staff" : "Editable until staff checklist verification"}>
                              {isApproved ? (
                                <Lock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <Unlock className="h-3.5 w-3.5 text-slate-400" />
                              )}
                            </span>
                            <button 
                              onClick={() => handleOpenPreview(cert)} 
                              className="text-[#002D62] dark:text-blue-400 hover:underline shrink-0"
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

      {}
      {/* --- MODAL 1: UPLOAD / EDIT CERTIFICATE FORM MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[24px] w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto transition-colors duration-300">
            
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
              <h2 className="text-[14px] font-black text-slate-800 dark:text-white uppercase tracking-wide">
                {editingCertId ? 'Edit Scholastic Record' : 'Upload Certificate'}
              </h2>
              <button onClick={closeFormModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-medium">✕</button>
            </div>

            <form onSubmit={handleCertificateUpload} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold flex items-start gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-red-500" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Certificate / Event Title *</label>
                <input 
                  type="text" required placeholder="e.g. Smart India Hackathon 2026" value={formTitle} onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm rounded-xl focus:outline-none focus:border-[#002D62] dark:focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Assigned Group Category *</label>
                <select 
                  value={formCategory} onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm rounded-xl focus:outline-none"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Host College / Institution *</label>
                <input 
                  type="text" required placeholder="e.g. KSRCE / IIT Madras" value={formOrg} onChange={(e) => setFormOrg(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm rounded-xl focus:outline-none focus:border-[#002D62] dark:focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">From Date *</label>
                  <input 
                    type="date" required value={formStart} onChange={(e) => setFormStart(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">To Date *</label>
                  <input 
                    type="date" required value={formEnd} onChange={(e) => setFormEnd(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Summary Overview (Optional)</label>
                <textarea 
                  placeholder="Provide a brief summary of project milestones, rewards, or core tech stacks..." value={formDesc} onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm rounded-xl h-16 resize-none focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                  {editingCertId ? 'Replace Attachment File (Optional)' : 'Upload Soft Copy Attachment *'}
                </label>
                <label className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-all">
                  <input 
                    type="file" accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg" required={!editingCertId && !formFileName} className="hidden" 
                    onChange={(e) => { if (e.target.files?.[0]) setFormFile(e.target.files[0]); }}
                  />
                  <FileUp className="h-5 w-5 text-slate-400 mb-1" />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 text-center truncate max-w-full px-2">
                    {formFile ? formFile.name : (formFileName ? `Current: ${formFileName.split('/').pop()}` : "Click to select local file")}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5 font-medium">Supports PDF, PNG, JPEG up to 5MB</span>
                </label>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="button" onClick={closeFormModal}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all bg-white dark:bg-slate-900"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={uploadingFile}
                  className="px-5 py-2 bg-[#002D62] dark:bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-[#001c3d] dark:hover:bg-blue-500 transition-all disabled:opacity-60 flex items-center gap-2"
                >
                  {uploadingFile && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {uploadingFile ? 'Uploading...' : editingCertId ? 'Update Record' : 'Save Certificate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: ADD NEW CUSTOM CATEGORY BUCKET --- */}
      {isCustomCategoryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[24px] w-full max-w-sm shadow-2xl border border-slate-100 dark:border-slate-800 p-5 transition-colors duration-300">
            
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-[13px] font-black text-slate-800 dark:text-white uppercase tracking-wide">Create Custom Category</h2>
              <button onClick={() => setIsCustomCategoryModalOpen(false)} className="text-slate-400 hover:text-slate-200 text-xs">✕</button>
            </div>

            <form onSubmit={handleAddCategory} className="pt-4 space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Category Group Name *</label>
                <input 
                  type="text" autoFocus required placeholder="e.g., Online Courses, NPTEL" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm rounded-xl focus:outline-none focus:border-[#002D62] dark:focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button 
                  type="button" onClick={() => setIsCustomCategoryModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Dismiss
                </button>
                <button 
                  type="submit"
                  className="px-4 py-1.5 bg-[#002D62] dark:bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-[#001c3d] dark:hover:bg-blue-500"
                >
                  Create Bucket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {}
      {/* --- CUSTOM OVERLAY CONFIRMATION DIALOG MODAL (no window.confirm used) --- */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[24px] w-full max-w-md shadow-2xl p-6 border border-slate-100 dark:border-slate-800 text-left space-y-4 animate-scaleUp transition-colors duration-300">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="p-3 bg-red-100 dark:bg-red-950/40 rounded-full">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-base font-black text-slate-800 dark:text-white tracking-tight">{confirmModal.title}</h3>
            </div>
            <p className="text-xs font-semibold leading-relaxed text-slate-500 dark:text-slate-400">{confirmModal.message}</p>
            <div className="flex gap-3 justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => setConfirmModal({ isOpen: false, title: '', message: '', actionType: 'delete_resume' })}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={executeConfirmAction}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all shadow-md"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {}
      {/* --- MODAL 3: DOCUMENT PREVIEW MODAL (Certificate Layout & Professional Resume Layouts) --- */}
      {previewDocument && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[28px] w-full max-w-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-300">
            
            {/* Header of Preview Panel */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-[#002D62] dark:text-blue-400" />
                <div>
                  <h3 className="text-sm font-black text-[#002D62] dark:text-blue-400 uppercase tracking-wide">Document Viewer Workspace</h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5 truncate max-w-xs sm:max-w-md">{previewDocument.fileName}</p>
                </div>
              </div>
              <button 
                onClick={() => setPreviewDocument(null)} 
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Document Content View Area */}
            <div className="flex-1 overflow-hidden bg-slate-100/50 dark:bg-slate-950/50 flex flex-col">
              {previewDocument.certificateUrl ? (
                /* Render actual uploaded file */
                (() => {
                  const url = previewDocument.certificateUrl!;
                  const isPdf = url.toLowerCase().includes('.pdf') || url.includes('application/pdf');
                  return isPdf ? (
                    <iframe
                      src={url}
                      className="w-full flex-1 min-h-[500px] border-0"
                      title="Certificate PDF"
                    />
                  ) : (
                    <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
                      <img
                        src={url}
                        alt="Certificate"
                        className="max-w-full max-h-[500px] rounded-xl shadow-md object-contain"
                      />
                    </div>
                  );
                })()
              ) : (
                /* No file URL — show info card */
                <div className="flex-1 flex items-center justify-center p-6">
                  <div className="text-center space-y-3">
                    <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto" />
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No document file available</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{previewDocument.description || 'No description provided.'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
              <button 
                onClick={() => setPreviewDocument(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all bg-white dark:bg-slate-900"
              >
                Close Viewer
              </button>
              <button 
                onClick={() => {
                  if (previewDocument.certificateUrl) {
                    const a = document.createElement('a');
                    a.href = previewDocument.certificateUrl;
                    a.target = '_blank';
                    a.rel = 'noopener noreferrer';
                    a.download = previewDocument.fileName || 'certificate';
                    a.click();
                  } else {
                    addToast('No file URL available for this certificate.', 'error');
                  }
                }}
                className="px-4 py-2 bg-[#002D62] dark:bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-[#001c3d] dark:hover:bg-blue-500 transition-all flex items-center gap-1.5 shadow-sm"
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