export interface StudentProfileData {
  // Basic Details
  name: string;
  email: string;
  regsNumber: string;
  department: string;
  year: string;            // 'I year' | 'II year' | 'III year' | 'IV year'
  semesterTerm: string;    // 'Odd' | 'Even'
  currentSemester: string;
  yearOfStudy: string;     // 4-digit entry year e.g. '2022'
  passOutYear: string;
  dob: string;

  // Communication
  phone: string;
  alternativePhone: string;
  address: string;
  isOtherState: boolean;
  stateName: string;
  district: string;
  pinCode: string;
  linkedinUrl: string;

  // Academic Records
  boardOfStudy: string;
  graduationStanding: 'UG' | 'PG' | '';
  diplomaPercentage: string;

  tenthPercentage: string;
  tenthSchool: string;       // maps to tenth_school in DB

  twelfthPercentage: string;
  twelfthSchool: string;     // maps to twelfth_school in DB

  // UG details — always required
  ugCollegeName: string;
  ugCgpa: string;   // UG: running CGPA | PG: completed UG degree CGPA

  // PG details — only when graduationStanding === 'PG'
  pgCollegeName: string;
  pgCgpa: string;   // auto-computed from PG SGPA

  // SGPA per semester
  sgpaSemesterValues: string[];

  // Computed
  finalCgpa: string;
  profileCreatedDate: string;
  profileUpdatedDate: string;

  // Staff-managed (read-only in student UI)
  isVerifiedByStaff?: boolean;
  placementStatus?: 'Placed' | 'Not Placed';
}

export interface FormErrors {
  [key: string]: string;
}
