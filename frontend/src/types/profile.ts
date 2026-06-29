export interface StudentProfileData {
  // Basic Details
  name: string;
  dob: string;
  regsNumber: string;
  department: string;
  year: string; // e.g. 'I year', 'II year'
  semesterTerm: 'Odd' | 'Even' | '';
  currentSemester: string;
  yearOfStudy: string; // Academic Entry Year
  passOutYear: string;

  // Communication & Contact Details
  email: string;
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
  tenthPercentage: string;
  tenthSchool?: string;
  twelfthPercentage?: string;
  twelfthSchool?: string;
  diplomaPercentage?: string;
  ugCgpa?: string; // Conditional for PG track
  finalCgpa?: string; // Calculated CGPA
  sgpaSemesterValues: string[];

  // Metadata, Media, & Admin Checks
  profilePic?: string;
  boardType?: string;
  profileCreatedDate?: string;
  profileUpdatedDate?: string;
  isVerifiedByStaff?: boolean; // Controls Blue vs Yellow rings
  placementStatus?: 'Placed' | 'Not Placed' | 'Pending'; // Controls Placement status card
}

export interface FormErrors {
  [key: string]: string;
}