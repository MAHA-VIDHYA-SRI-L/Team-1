import type { StudentProfileData, FormErrors } from '../types/profile';

export const validateStudentData = (data: StudentProfileData, currentStep: number): FormErrors => {
  const errors: FormErrors = {};

  if (currentStep === 1) {
    if (!data.department) errors.department = 'Department selection is required';
    if (!data.year) errors.year = 'Year of study is required';
    if (!data.semesterTerm) errors.semesterTerm = 'Academic term selection is required';
    if (!data.dob) errors.dob = 'Date of birth is required';
    if (data.yearOfStudy.length !== 4) errors.yearOfStudy = 'Academic entry year must be 4 digits';
  }

  if (currentStep === 2) {
    if (!data.phone || data.phone.length !== 10) errors.phone = 'Phone must be exactly 10 digits';
    if (data.alternativePhone && data.alternativePhone.length !== 10)
      errors.alternativePhone = 'Alternative phone must be exactly 10 digits';
    if (data.pinCode && data.pinCode.length !== 6) errors.pinCode = 'Pincode must be exactly 6 digits';
    if (data.linkedinUrl.trim()) {
      const linkedinRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/;
      if (!linkedinRegex.test(data.linkedinUrl)) errors.linkedinUrl = 'Please enter a valid LinkedIn URL';
    }
  }

  if (currentStep === 3) {
    if (!data.boardOfStudy) errors.boardOfStudy = 'Board of affiliation is required';
    if (!data.graduationStanding) errors.graduationStanding = 'Graduation standing is required';
    if (!data.tenthPercentage) errors.tenthPercentage = '10th percentage is required';

    if (!data.ugCollegeName.trim()) errors.ugCollegeName = 'UG college name is required';
    if (!data.ugCgpa) errors.ugCgpa = data.graduationStanding === 'PG' ? 'Completed UG CGPA is required' : 'Current CGPA is required';

    if (data.graduationStanding === 'PG') {
      if (!data.pgCollegeName.trim()) errors.pgCollegeName = 'PG college name is required';
    }
    const requiredSems = getAllowedBoxesCount(data.year);
    for (let i = 0; i < requiredSems; i++) {
      if (!data.sgpaSemesterValues[i] || isNaN(parseFloat(data.sgpaSemesterValues[i]))) {
        errors.sgpaMatrix = `Please fill all ${requiredSems} completed semester SGPA values`;
        break;
      }
    }
  }

  return errors;
};

export const getAllowedBoxesCount = (year: string): number => {
  if (year === 'I year') return 2;
  if (year === 'II year') return 4;
  if (year === 'III year') return 6;
  if (year === 'IV year') return 8;
  return 0;
};

export const calculateCgpa = (year: string, sems: string[]): string => {
  const count = getAllowedBoxesCount(year);
  if (count === 0) return '0.00';
  let total = 0, parsedCount = 0;
  for (let i = 0; i < count; i++) {
    const val = parseFloat(sems[i]);
    if (!isNaN(val)) { total += val; parsedCount++; }
  }
  return parsedCount > 0 ? (total / parsedCount).toFixed(2) : '0.00';
};
