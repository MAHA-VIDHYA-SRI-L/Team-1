export interface StudentProfileData {
  // Basics details
  name: string;
  department: string;
  year: 'I year' | 'II year' | 'III year' | 'IV year' | '';
  regsNumber: string;
  yearOfStudy: string; 
  passOutYear: string; 

  // Communication & contact details
  email: string;
  phone: string;
  alternativePhone: string;
  address: string;
  isOtherState: boolean;
  stateName: string; // Will hold "Tamil Nadu" or custom input
  pinCode: string;
  district: string;

  // Academic details
  boardOfStudy: string;
  graduationStanding: 'UG' | 'PG' | '';
  tenthPercentage: string;
  twelfthPercentage: string;
  diplomaPercentage: string;
  ugCgpa: string; 
  sgpaSemesterValues: string[]; // Length 8 array tracking Sem 1 to Sem 8
}

export interface FormErrors {
  [key: string]: string;
}