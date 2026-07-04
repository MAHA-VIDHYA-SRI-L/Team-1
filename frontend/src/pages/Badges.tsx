import React, { useState, useMemo, useEffect } from 'react';
import { 
  Award, BookOpen, FileText, Briefcase, Plus, Calendar, MapPin, FileUp, 
  Trash2, FolderPlus, ArrowLeft, Edit2, Lock, Unlock, Download, Upload
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import logoUrl from '../assets/logo.jpg';
import { ThemeToggle } from '../components/ThemeToggle';
import {
  Button, Input, Select, Card, Modal, Badge, EmptyState, FormError, PageHeader
} from '../components/ui';
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
    setConfirmModal({ isOpen: false, title: '', message: '', actionType: 'delete_resume' });
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
    setFormFile(null);
    setFormError('');
    setIsModalOpen(true);
  };

  const filteredCertificates = useMemo(() => {
    return certificates.filter(c => c.category === activeTab);
  }, [certificates, activeTab]);

  const approvedCount = useMemo(() => certificates.filter(c => c.status === 'Approved').length, [certificates]);
  const progressPercent = useMemo(() => certificates.length > 0 ? Math.round((approvedCount / certificates.length) * 100) : 0, [certificates, approvedCount]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] flex flex-col font-sans antialiased text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* Page Header */}
      <PageHeader
        logo={
          <div className="h-10 w-10 rounded-2xl overflow-hidden ring-2 ring-slate-200/80 dark:ring-slate-700 shadow-sm shrink-0 bg-white p-0.5">
            <img src={logoUrl} className="w-full h-full object-contain rounded-xl" alt="Placemate Logo" />
          </div>
        }
        title="Placemate"
        badge="Credentials Hub"
        subtitle="Badges & Scholastic Certificates"
        actions={
          <div className="flex items-center gap-3">
            {onBackToDashboard && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onBackToDashboard}
                icon={<ArrowLeft className="h-4 w-4" />}
              >
                Back to Dashboard
              </Button>
            )}
            <ThemeToggle variant="button" />
            <Button
              variant="primary"
              size="sm"
              onClick={() => { setFormCategory(activeTab); setIsModalOpen(true); }}
              icon={<Plus className="h-4 w-4" />}
            >
              Upload Certificate
            </Button>
          </div>
        }
      />

      {/* Main Area */}
      <main className="max-w-[1600px] w-full mx-auto px-6 sm:px-10 xl:px-14 py-8 flex-1 relative z-10">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">
          
          {/* Left Column: Profile Card, Audit Stats & Guidelines */}
          <div className="xl:col-span-1 space-y-6">
            {/* User Profile Card */}
            <Card className="p-6 bg-gradient-to-br from-[#002D62] to-[#00428c] text-white border-0 shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md text-white font-black text-xl flex items-center justify-center border border-white/20">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-base font-black leading-tight">{user.fullName}</p>
                  <p className="text-[11px] font-bold text-blue-200 mt-1 uppercase tracking-wider">{user.department} Department</p>
                </div>
              </div>
            </Card>

            {/* Metrics Dashboard Card */}
            <Card className="p-6 space-y-5">
              <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Credentials Audit</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 text-center">
                  <span className="text-2xl font-black text-slate-800 dark:text-white block">{certificates.length}</span>
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest">Total Uploaded</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 text-center">
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block">
                    {approvedCount}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-555 uppercase tracking-widest">Verified</span>
                </div>
              </div>

              {/* Dynamic Progress Bar */}
              <div className="space-y-2 pt-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider">
                  <span>Verification Progress</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{progressPercent}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700/50 p-0.5">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-700 ease-out" 
                    style={{ width: `${progressPercent}%` }} 
                  />
                </div>
              </div>

              {progressPercent === 100 && certificates.length > 0 && (
                <div className="flex items-center gap-2 p-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-xl text-[10px] text-emerald-700 dark:text-emerald-400 font-extrabold uppercase tracking-wide justify-center animate-pulse">
                  🎉 Portfolio Fully Verified
                </div>
              )}
            </Card>

            {/* Quick Actions / Guidelines */}
            <Card className="p-6 space-y-4">
              <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Guidelines</h3>
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-2.5 font-semibold">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-extrabold mt-0.5">•</span>
                  <span>Supported files: PDF, PNG, JPEG (max 5MB).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-extrabold mt-0.5">•</span>
                  <span>Uploading files automatically updates placement readiness reports.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-extrabold mt-0.5">•</span>
                  <span>Subject to verification checklist before final lock.</span>
                </li>
              </ul>
              <div className="pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsCustomCategoryModalOpen(true)}
                  icon={<FolderPlus className="h-4 w-4 text-[#002D62] dark:text-blue-400" />}
                  className="w-full"
                >
                  Create Custom Category
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Column: Tab navigation & Certificates view */}
          <div className="xl:col-span-3 space-y-6">
            {/* Category tabs container */}
            <div className="bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-1">
                {categories.map((cat) => {
                  const count = certificates.filter(c => c.category === cat).length;
                  const isActive = activeTab === cat;
                  return (
                    <Button
                      key={cat}
                      type="button"
                      variant={isActive ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => setActiveTab(cat)}
                      className={`shrink-0 ${isActive ? 'shadow-md' : 'border-slate-200/60 dark:border-slate-700/60 bg-slate-100/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100'}`}
                      icon={getCategoryIcon(cat, "h-4 w-4 shrink-0")}
                    >
                      <span>{cat}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}>
                        {count}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Certificates List / Grid */}
            <div>
              {filteredCertificates.length === 0 ? (
                <Card className="p-12">
                  <EmptyState
                    icon={getCategoryIcon(activeTab, "h-12 w-12 text-[#002D62] dark:text-blue-400")}
                    title={`Start Building Your "${activeTab}" Portfolio`}
                    description="Upload your certificates, achievement badges, and event proofs here. Our AI will analyze them for your placement readiness report."
                    action={
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => { setFormCategory(activeTab); setIsModalOpen(true); }}
                        icon={<Upload className="h-4 w-4" />}
                      >
                        Upload First Achievement
                      </Button>
                    }
                  />
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredCertificates.map((cert) => {
                    const isApproved = cert.status === 'Approved';
                    return (
                      <Card
                        key={cert.id}
                        hover={true}
                        className={`overflow-hidden flex flex-col border-2 transition-all ${
                          isApproved ? 'border-emerald-200/80 dark:border-emerald-800/50' : 'border-slate-200/80 dark:border-slate-700/80'
                        }`}
                      >
                        {/* Thumbnail wrapper */}
                        <div className="h-44 bg-slate-100 dark:bg-slate-800/60 relative flex items-center justify-center border-b border-slate-100 dark:border-slate-800 overflow-hidden group/thumb">
                          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#002d62_1px,transparent_1px)] [background-size:12px_12px]" />
                          
                          <div className="w-[85%] h-[80%] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 relative flex flex-col justify-between select-none">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1.5">
                                <div className="h-2 w-20 bg-slate-300 dark:bg-slate-700 rounded" />
                                <div className="h-1.5 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
                              </div>
                              <div className="h-7 w-7 rounded-full border-2 border-[#002D62]/10 dark:border-blue-400/20 flex items-center justify-center">
                                {getCategoryIcon(cert.category, "h-3.5 w-3.5 text-[#002D62] dark:text-blue-400")}
                              </div>
                            </div>
                            
                            <div className="flex items-end justify-between">
                              <div className="space-y-1">
                                <div className="h-1.5 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                                <div className="h-1 w-20 bg-slate-100 dark:bg-slate-800/50 rounded" />
                              </div>
                              <div className={`h-9 w-9 rounded-full flex items-center justify-center text-[7px] font-black uppercase rotate-[-12deg] border-2 border-dashed ${
                                isApproved ? 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/40' : 'border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-50/80 dark:bg-amber-950/40'
                              }`}>
                                {isApproved ? 'VERIFIED' : 'PENDING'}
                              </div>
                            </div>
                          </div>

                          {/* Top left status badge */}
                          <div className="absolute top-3 left-3">
                            <Badge variant={isApproved ? 'success' : 'warning'} dot={true}>
                              {cert.status}
                            </Badge>
                          </div>

                          {/* Actions overlay panel shown upon hovering thumbnail */}
                          <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                            <Button
                              variant="secondary"
                              size="xs"
                              onClick={() => handleEditOpen(cert)}
                              title="Edit Submission"
                              icon={<Edit2 className="h-3.5 w-3.5 text-[#002D62] dark:text-blue-400" />}
                            />
                            <Button
                              variant="secondary"
                              size="xs"
                              onClick={() => triggerCertificateDeleteConfirm(cert.id)}
                              title="Delete Submission"
                              icon={<Trash2 className="h-3.5 w-3.5 text-red-500 dark:text-red-400" />}
                            />
                          </div>
                        </div>

                        {/* Details block */}
                        <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-3">
                            <h3 className="font-extrabold text-slate-800 dark:text-white text-base leading-snug line-clamp-1" title={cert.title}>
                              {cert.title}
                            </h3>
                            
                            <div className="space-y-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                                <span className="truncate text-slate-700 dark:text-slate-300">{cert.issuingOrganization}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                                <span>{cert.startDate} — {cert.endDate}</span>
                              </div>
                            </div>

                            {cert.description && (
                              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                {cert.description}
                              </p>
                            )}
                          </div>

                          {/* Footer row */}
                          <div className="pt-4 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between text-xs font-bold">
                            <div className="flex items-center gap-1.5 text-slate-400 max-w-[140px] truncate">
                              <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                              <span className="font-mono text-[11px] font-normal truncate">{cert.fileName}</span>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="flex items-center" title={isApproved ? "Verified & Locked by Staff" : "Editable until staff checklist verification"}>
                                {isApproved ? (
                                  <Lock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                  <Unlock className="h-4 w-4 text-slate-400" />
                                )}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="xs"
                                onClick={() => handleOpenPreview(cert)}
                                className="text-[#002D62] dark:text-blue-400 hover:underline font-extrabold shrink-0"
                              >
                                View Document →
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* --- MODAL 1: UPLOAD / EDIT CERTIFICATE FORM MODAL --- */}
      {isModalOpen && (
        <Modal title={editingCertId ? 'Edit Scholastic Record' : 'Upload Certificate'} onClose={closeFormModal} size="md">
          <form onSubmit={handleCertificateUpload} className="space-y-4">
            {formError && <FormError message={formError} />}

            <Input
              label="Certificate / Event Title *"
              type="text"
              required
              placeholder="e.g. Smart India Hackathon 2026"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
            />

            <Select
              label="Assigned Group Category *"
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>

            <Input
              label="Host College / Institution *"
              type="text"
              required
              placeholder="e.g. KSRCE / IIT Madras"
              value={formOrg}
              onChange={(e) => setFormOrg(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="From Date *"
                type="date"
                required
                value={formStart}
                onChange={(e) => setFormStart(e.target.value)}
              />
              <Input
                label="To Date *"
                type="date"
                required
                value={formEnd}
                onChange={(e) => setFormEnd(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Summary Overview (Optional)
              </label>
              <textarea 
                placeholder="Provide a brief summary of project milestones, rewards, or core tech stacks..."
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                className="w-full px-3.5 py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm font-medium rounded-xl h-20 resize-none focus:outline-none focus:border-[#002D62] dark:focus:border-blue-400 focus:ring-2 focus:ring-[#002D62]/10 transition-all shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                {editingCertId ? 'Replace Attachment File (Optional)' : 'Upload Soft Copy Attachment *'}
              </label>
              <label className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-all group">
                <input 
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
                  required={!editingCertId && !formFileName}
                  className="hidden" 
                  onChange={(e) => { if (e.target.files?.[0]) setFormFile(e.target.files[0]); }}
                />
                <div className="h-10 w-10 rounded-2xl bg-[#002D62]/10 dark:bg-blue-900/30 flex items-center justify-center text-[#002D62] dark:text-blue-400 mb-2 group-hover:scale-105 transition-transform">
                  <FileUp className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 text-center truncate max-w-full px-2">
                  {formFile ? formFile.name : (formFileName ? `Current: ${formFileName.split('/').pop()}` : "Click to select local file")}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 font-medium">Supports PDF, PNG, JPEG up to 5MB</span>
              </label>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="secondary"
                size="md"
                type="button"
                onClick={closeFormModal}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                type="submit"
                loading={uploadingFile}
              >
                {editingCertId ? 'Update Record' : 'Save Certificate'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* --- MODAL 2: ADD NEW CUSTOM CATEGORY BUCKET --- */}
      {isCustomCategoryModalOpen && (
        <Modal title="Create Custom Category" onClose={() => setIsCustomCategoryModalOpen(false)} size="sm">
          <form onSubmit={handleAddCategory} className="space-y-4">
            <Input
              label="Category Group Name *"
              type="text"
              autoFocus
              required
              placeholder="e.g., Online Courses, NPTEL"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />

            <div className="flex gap-2 justify-end pt-3">
              <Button
                variant="secondary"
                size="sm"
                type="button"
                onClick={() => setIsCustomCategoryModalOpen(false)}
              >
                Dismiss
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
              >
                Create Bucket
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* --- CONFIRMATION DIALOG MODAL --- */}
      {confirmModal.isOpen && (
        <Modal title={confirmModal.title} onClose={() => setConfirmModal({ isOpen: false, title: '', message: '', actionType: 'delete_resume' })} size="sm">
          <div className="space-y-4">
            <p className="text-sm font-semibold leading-relaxed text-slate-600 dark:text-slate-300">{confirmModal.message}</p>
            <div className="flex gap-3 justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setConfirmModal({ isOpen: false, title: '', message: '', actionType: 'delete_resume' })}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={executeConfirmAction}
              >
                Yes, Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* --- MODAL 3: DOCUMENT PREVIEW MODAL --- */}
      {previewDocument && (
        <Modal title="Document Viewer Workspace" onClose={() => setPreviewDocument(null)} size="lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 truncate max-w-md">{previewDocument.fileName}</p>
              {previewDocument.status && (
                <Badge variant={previewDocument.status === 'Approved' ? 'success' : 'warning'} dot={true}>
                  {previewDocument.status}
                </Badge>
              )}
            </div>

            {/* Document Content View Area */}
            <div className="bg-slate-100 dark:bg-slate-950 rounded-2xl overflow-hidden min-h-[450px] flex flex-col items-center justify-center border border-slate-200/80 dark:border-slate-800">
              {previewDocument.certificateUrl ? (
                (() => {
                  const url = previewDocument.certificateUrl!;
                  const isPdf = url.toLowerCase().includes('.pdf') || url.includes('application/pdf');
                  return isPdf ? (
                    <iframe
                      src={url}
                      className="w-full flex-1 min-h-[480px] border-0"
                      title="Certificate PDF"
                    />
                  ) : (
                    <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
                      <img
                        src={url}
                        alt="Certificate"
                        className="max-w-full max-h-[480px] rounded-xl shadow-md object-contain"
                      />
                    </div>
                  );
                })()
              ) : (
                <div className="text-center p-8 space-y-3">
                  <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto" />
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No document file available</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mx-auto">{previewDocument.description || 'No description provided.'}</p>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPreviewDocument(null)}
              >
                Close Viewer
              </Button>
              <Button
                variant="primary"
                size="sm"
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
                icon={<Download className="h-3.5 w-3.5" />}
              >
                Download Attachment
              </Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}