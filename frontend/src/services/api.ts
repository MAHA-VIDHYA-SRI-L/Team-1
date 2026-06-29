import type { StudentProfileData } from '../types/profile';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getToken = (): string => localStorage.getItem('token') || '';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

export const updateSelfPlacement = async (placement_status: string, company_name?: string) => {
  const res = await fetch(`${BASE_URL}/student/placement`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ placement_status, company_name }),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
};

export const fetchStaffStudents = async () => {
  const res = await fetch(`${BASE_URL}/staff/students`, { headers: authHeaders() });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
};

export const fetchStaffStudentById = async (id: string) => {
  const res = await fetch(`${BASE_URL}/staff/students/${id}`, { headers: authHeaders() });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
};

export const updatePlacementStatus = async (id: string, placement_status: string, company_name?: string) => {
  const res = await fetch(`${BASE_URL}/staff/students/${id}/placement`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ placement_status, company_name }),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
};

export const verifyStudentByStaff = async (id: string, is_verified: boolean) => {
  const res = await fetch(`${BASE_URL}/staff/students/${id}/verify`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ is_verified }),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
};

export const updateCertStatus = async (certId: string, status: string) => {
  const res = await fetch(`${BASE_URL}/staff/certifications/${certId}/status`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
};

export const fetchCertifications = async () => {
  const res = await fetch(`${BASE_URL}/student/certifications`, { headers: authHeaders() });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
};

export const addCertification = async (body: Record<string, string>) => {
  const res = await fetch(`${BASE_URL}/student/certifications`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
};

export const editCertification = async (id: string, body: Record<string, string>) => {
  const res = await fetch(`${BASE_URL}/student/certifications/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
};

export const removeCertification = async (id: string) => {
  const res = await fetch(`${BASE_URL}/student/certifications/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
};

export const fetchResume = async () => {
  const res = await fetch(`${BASE_URL}/student/resume`, { headers: authHeaders() });
  if (!res.ok) return null;
  return res.json();
};

export const uploadResume = async (file: File) => {
  const form = new FormData();
  form.append('resume', file);
  const res = await fetch(`${BASE_URL}/student/resume`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
    body: form,
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
};

export const fetchAnalysis = async () => {
  const res = await fetch(`${BASE_URL}/student/analyze`, { headers: authHeaders() });
  if (!res.ok) return null;
  return res.json();
};

export const runAnalysis = async () => {
  const res = await fetch(`${BASE_URL}/student/analyze`, {
    method: 'POST',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
};

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return null;
  const r = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!r.ok) return null;
  const d = await r.json();
  localStorage.setItem('token', d.token);
  localStorage.setItem('refreshToken', d.refreshToken);
  return d.token;
};

export const fetchStudentProfile = async (): Promise<{ profile: Partial<import('../types/profile').StudentProfileData> }> => {
  let res = await fetch(`${BASE_URL}/student/profile`, { headers: authHeaders() });
  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (!newToken) throw new Error('unauthorized');
    res = await fetch(`${BASE_URL}/student/profile`, {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${newToken}` },
    });
  }
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
      department: p.branch,
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
  const res = await fetch(`${BASE_URL}/student/profile`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
};

export const fetchAcademicDetails = async (): Promise<{ academic: Partial<import('../types/profile').StudentProfileData> }> => {
  const res = await fetch(`${BASE_URL}/student/academic`, { headers: authHeaders() });
  if (!res.ok) throw new Error((await res.json()).error);
  const { academic: a } = await res.json();
  return {
    academic: {
      boardOfStudy: a.board_of_study,
      graduationStanding: a.graduation_standing,
      tenthPercentage: a.tenth_percentage?.toString() ?? '',
      tenthSchool: a.tenth_school,
      twelfthPercentage: a.twelfth_percentage?.toString() ?? '',
      twelfthSchool: a.twelfth_school,
      diplomaPercentage: a.diploma_percentage?.toString() ?? '',
      diplomaInstitution: a.diploma_institution ?? '',
      ugCollegeName: a.ug_college,
      ugCgpa: a.ug_cgpa?.toString() ?? '',
      pgCollegeName: a.pg_college,
      pgCgpa: a.pg_cgpa?.toString() ?? '',
      finalCgpa: a.ug_cgpa?.toString() ?? '',
      sgpaSemesterValues: Array.isArray(a.sgpa_values) ? a.sgpa_values : Array(8).fill(''),
      placementStatus: a.placement_status,
      placementVerified: a.placement_verified,
      companyName: a.company_name,
    },
  };
};

export const saveAcademicDetails = async (data: StudentProfileData, isUpdate: boolean) => {
  const body = {
    board_of_study: data.boardOfStudy,
    graduation_standing: data.graduationStanding,
    tenth_school: data.tenthSchool,
    tenth_percentage: parseFloat(data.tenthPercentage) || null,
    twelfth_school: data.twelfthSchool,
    twelfth_percentage: parseFloat(data.twelfthPercentage) || null,
    diploma_percentage: parseFloat(data.diplomaPercentage) || null,
    diploma_institution: data.diplomaInstitution || null,
    ug_college: data.ugCollegeName,
    ug_cgpa: parseFloat(data.ugCgpa) || null,
    pg_college: data.graduationStanding === 'PG' ? data.pgCollegeName : null,
    pg_cgpa: data.graduationStanding === 'PG' ? (parseFloat(data.pgCgpa) || null) : null,
    sgpa_values: data.sgpaSemesterValues,
    ...(isUpdate ? {} : { placement_status: data.placementStatus || 'Not Placed' }),
  };
  const res = await fetch(`${BASE_URL}/student/academic`, {
    method: isUpdate ? 'PUT' : 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
};
