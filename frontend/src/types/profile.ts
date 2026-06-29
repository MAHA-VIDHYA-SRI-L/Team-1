export interface StudentProfileData {
  name: string;
  email: string;
  regsNumber: string;
  department: string;
  year: string;
  semesterTerm: string;
  currentSemester: string;
  yearOfStudy: string;
  passOutYear: string;
  dob: string;

  phone: string;
  alternativePhone: string;
  address: string;
  isOtherState: boolean;
  stateName: string;
  district: string;
  pinCode: string;
  linkedinUrl: string;

  boardOfStudy: string;
  graduationStanding: 'UG' | 'PG' | '';
  diplomaPercentage: string;
  diplomaInstitution: string;

  tenthPercentage: string;
  tenthSchool: string;

  twelfthPercentage: string;
  twelfthSchool: string;

  ugCollegeName: string;
  ugCgpa: string;

  pgCollegeName: string;
  pgCgpa: string;

  sgpaSemesterValues: string[];

  finalCgpa: string;
  profileCreatedDate: string;
  profileUpdatedDate: string;

  isVerifiedByStaff?: boolean;
  placementStatus?: 'Placed' | 'Not Placed';
  placementVerified?: boolean;
  companyName?: string;
}

export interface FormErrors {
  [key: string]: string;
}
