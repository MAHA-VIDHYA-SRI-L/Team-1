import type { StudentProfileData } from '../types/profile';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

let _authToken = sessionStorage.getItem('_pm_token') || '';
let _refreshToken = sessionStorage.getItem('_pm_refresh') || '';
let _refreshInProgress = false;
let _onUnauthorized: (() => void) | null = null;

// Shared data mapping function for student records from API
export interface StudentRecord {
  id: string;
  regNo: string;
  name: string;
  dept: string;
  readinessScore: number;
  status: 'Placed' | 'Not Placed';
  placementVerified: boolean;
  company?: string;
  email: string;
  isBlocked: boolean;
  isVerified: boolean;
}

export const mapStudentRecord = (s: any): StudentRecord => ({
  id: s.id,
  regNo: s.register_no ?? '',
  name: s.full_name ?? '',
  dept: (s.branch ?? '').trim().toUpperCase(),
  readinessScore: s.readiness_score ?? 0,
  status: s.placement_status === 'Placed' ? 'Placed' : 'Not Placed',
  placementVerified: s.placement_verified ?? false,
  company: s.company_name ?? undefined,
  email: s.email ?? '',
  isBlocked: s.is_blocked ?? false,
  isVerified: s.is_verified ?? false,
});

const getToken = (): string => _authToken;

const buildHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const tok = getToken();
  if (tok) headers['Authorization'] = ['Bearer', tok].join(' ');
  return headers;
};

const authHeaders = buildHeaders;

export const setTokens = (token: string, refreshToken?: string) => {
  _authToken = token;
  sessionStorage.setItem('_pm_token', token);
  if (refreshToken) {
    _refreshToken = refreshToken;
    sessionStorage.setItem('_pm_refresh', refreshToken);
  }
};

export const clearTokens = () => {
  _authToken = '';
  _refreshToken = '';
  sessionStorage.removeItem('_pm_token');
  sessionStorage.removeItem('_pm_refresh');
};

export const setUnauthorizedHandler = (handler: () => void) => {
  _onUnauthorized = handler;
};

// Attempts to refresh the session; returns true if successful
const tryRefresh = async (): Promise<boolean> => {
  if (!_refreshToken) return false;
  if (_refreshInProgress) {
    // Wait for existing refresh to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    return _authToken !== '';
  }
  _refreshInProgress = true;
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: _refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    setTokens(data.token, data.refreshToken);
    return true;
  } catch {
    return false;
  } finally {
    _refreshInProgress = false;
  }
};

// Fetch wrapper that auto-retries once after token refresh on 401
const apiFetch = async (input: string, init?: RequestInit): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    let res = await fetch(input, { ...init, signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.status === 401 && _refreshToken) {
      const refreshed = await tryRefresh();
      if (refreshed) {
        // Rebuild auth header with new token
        const newInit: RequestInit = {
          ...init,
          headers: { ...(init?.headers as Record<string, string> || {}), Authorization: `Bearer ${_authToken}` },
        };
        res = await fetch(input, newInit);
      }
    }
    if (res.status === 401) {
      _onUnauthorized?.();
    }
    return res;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
};

export const updateSelfPlacement = async (placement_status: string, company_name?: string) => {
  const res = await apiFetch(`${BASE_URL}/student/placement`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ placement_status, company_name }),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
};

export const fetchStaffStudents = async () => {
  const res = await apiFetch(`${BASE_URL}/staff/students`, { headers: authHeaders() });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
};

export const fetchStaffStudentById = async (id: string) => {
  const res = await apiFetch(`${BASE_URL}/staff/students/${id}`, { headers: authHeaders() });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
};

export const updatePlacementStatus = async (id: string, placement_status: string, company_name?: string) => {
  const res = await apiFetch(`${BASE_URL}/staff/students/${id}/placement`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ placement_status, company_name }),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
};

export const verifyStudentByStaff = async (id: string, is_verified: boolean) => {
  const res = await apiFetch(`${BASE_URL}/staff/students/${id}/verify`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ is_verified }),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
};

export const updateCertStatus = async (certId: string, status: string) => {
  const res = await apiFetch(`${BASE_URL}/staff/certifications/${certId}/status`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
};

export const blockStudent = async (id: string, is_blocked: boolean) => {
  const res = await apiFetch(`${BASE_URL}/staff/students/${id}/block`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ is_blocked }),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
};

export const fetchCertifications = async () => {
  const res = await apiFetch(`${BASE_URL}/student/certifications`, { headers: authHeaders() });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
};

export const addCertification = async (body: Record<string, string>) => {
  const res = await apiFetch(`${BASE_URL}/student/certifications`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
};

export const editCertification = async (id: string, body: Record<string, string>) => {
  const res = await apiFetch(`${BASE_URL}/student/certifications/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
};

export const removeCertification = async (id: string) => {
  const res = await apiFetch(`${BASE_URL}/student/certifications/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
};

export const uploadCertificateFile = async (file: File): Promise<string> => {
  const form = new FormData();
  form.append('file', file);
  const res = await apiFetch(`${BASE_URL}/student/certifications/upload-file`, {
    method: 'POST',
    headers: { Authorization: ['Bearer', getToken()].join(' ') },
    body: form,
  });
  if (!res.ok) throw new Error((await res.json()).error);
  const data = await res.json();
  return data.url;
};

export const fetchResume = async () => {
  const res = await apiFetch(`${BASE_URL}/student/resume`, { headers: authHeaders() });
  if (!res.ok) return null;
  return res.json();
};

export const uploadResume = async (file: File) => {
  const form = new FormData();
  form.append('resume', file);
  const res = await apiFetch(`${BASE_URL}/student/resume`, {
    method: 'POST',
    headers: { Authorization: ['Bearer', getToken()].join(' ') },
    body: form,
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
};

export const fetchAnalysis = async () => {
  const res = await apiFetch(`${BASE_URL}/student/analyze`, { headers: authHeaders() });
  if (!res.ok) return null;
  return res.json();
};

export const runAnalysis = async () => {
  const res = await apiFetch(`${BASE_URL}/student/analyze`, {
    method: 'POST',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
};

export const fetchStudentProfile = async (): Promise<{ profile: Partial<StudentProfileData> }> => {
  const res = await apiFetch(`${BASE_URL}/api/student/profile`, { headers: authHeaders() });
  if (res.status === 401 || res.status === 403) throw new Error('unauthorized');
  if (!res.ok) return { profile: {} };
  const { profile: p } = await res.json();
  return {
    profile: {
      name: p.full_name,
      email: p.email,
      regsNumber: p.register_no,
      phone: p.phone,
      alternativePhone: p.alternative_phone,
      address: p.address,
      dob: p.dob,
      year: p.current_year,
      yearOfStudy: p.year_of_study,
      passOutYear: p.pass_out_year,
      currentSemester: p.current_semester,
      semesterTerm: p.semester_term,
      linkedinUrl: p.linkedin_url,
      district: p.district,
      stateName: p.state_name,
      pinCode: p.pin_code,
      isOtherState: p.state_name !== 'Tamil Nadu',
      isVerifiedByStaff: p.is_verified,
      department: p.branch,
    },
  };
};

export const saveStudentProfile = async (data: StudentProfileData) => {
  const body = {
    phone: data.phone,
    alternative_phone: data.alternativePhone,
    address: data.address,
    district: data.district,
    state_name: data.stateName,
    pin_code: data.pinCode,
    dob: data.dob,
    degree: data.graduationStanding,
    branch: data.department,
    current_year: data.year,
    year_of_study: data.yearOfStudy,
    pass_out_year: data.passOutYear,
    current_semester: data.currentSemester,
    semester_term: data.semesterTerm,
    linkedin_url: data.linkedinUrl,
  };
  const res = await apiFetch(`${BASE_URL}/api/student/profile`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
};

export const fetchAcademicDetails = async (): Promise<{ academic: Partial<StudentProfileData> }> => {
  const res = await apiFetch(`${BASE_URL}/apistudent/academic`, { headers: authHeaders() });
  if (res.status === 404) return { academic: {} };
  if (!res.ok) throw new Error((await res.json()).error);
  const { academic: a } = await res.json();
  const isPG = a.graduation_standing === 'PG';
  const ugCgpa = a.ug_cgpa != null ? a.ug_cgpa.toString() : '';
  const pgCgpa = a.pg_cgpa != null ? a.pg_cgpa.toString() : '';
  return {
    academic: {
      boardOfStudy: a.board_of_study,
      graduationStanding: a.graduation_standing,
      tenthPercentage: a.tenth_percentage?.toString() ?? '',
      tenthSchool: a.tenth_school ?? '',
      twelfthPercentage: a.twelfth_percentage?.toString() ?? '',
      twelfthSchool: a.twelfth_school ?? '',
      diplomaPercentage: a.diploma_percentage?.toString() ?? '',
      diplomaInstitution: a.diploma_institution ?? '',
      ugCollegeName: a.ug_college ?? '',
      ugCgpa,
      pgCollegeName: a.pg_college ?? '',
      pgCgpa,
      finalCgpa: isPG ? pgCgpa : ugCgpa,
      sgpaSemesterValues: Array.isArray(a.sgpa_values)
        ? a.sgpa_values.map((v: any) => (v != null && v !== '' ? String(v) : ''))
        : Array(8).fill(''),
      placementStatus: a.placement_status ?? 'Not Placed',
      placementVerified: a.placement_verified ?? false,
      companyName: a.company_name ?? '',
    },
  };
};

export const fetchSkills = async () => {
  const res = await apiFetch(`${BASE_URL}/student/skills`, { headers: authHeaders() });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
};

export const addSkill = async (body: { skill_name: string; proficiency?: string }) => {
  const res = await apiFetch(`${BASE_URL}/student/skills`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
};

export const deleteSkill = async (id: string) => {
  const res = await apiFetch(`${BASE_URL}/student/skills/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
};

export const fetchInternships = async () => {
  const res = await apiFetch(`${BASE_URL}/student/internships`, { headers: authHeaders() });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
};

export const addInternship = async (body: Record<string, string>) => {
  const res = await apiFetch(`${BASE_URL}/student/internships`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
};

export const deleteInternship = async (id: string) => {
  const res = await apiFetch(`${BASE_URL}/student/internships/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
};

export const saveAcademicDetails = async (data: StudentProfileData) => {
  const toNum = (v: string | undefined | null) =>
    v !== '' && v != null && !isNaN(parseFloat(v as string)) ? parseFloat(v as string) : null;

  const body = {
    board_of_study: data.boardOfStudy,
    graduation_standing: data.graduationStanding,
    tenth_school: data.tenthSchool,
    tenth_percentage: toNum(data.tenthPercentage),
    twelfth_school: data.twelfthSchool,
    twelfth_percentage: toNum(data.twelfthPercentage),
    diploma_percentage: toNum(data.diplomaPercentage),
    diploma_institution: data.diplomaInstitution || null,
    ug_college: data.ugCollegeName,
    ug_cgpa: toNum(data.ugCgpa),
    pg_college: data.graduationStanding === 'PG' ? (data.pgCollegeName || null) : null,
    pg_cgpa: data.graduationStanding === 'PG' ? toNum(data.pgCgpa) : null,
    sgpa_values: (data.sgpaSemesterValues || []).map(v => (v != null ? String(v) : '')),
    placement_status: data.placementStatus || 'Not Placed',
  };
  const res = await apiFetch(`${BASE_URL}/api/student/academic`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
};
