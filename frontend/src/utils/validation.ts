// Changed this line to use "import type" 👇
import type { StudentProfileData, FormErrors } from '../types/profile';

export const validateStudentData = (data: StudentProfileData, currentStep: number): FormErrors => {
  const errors: FormErrors = {};

  if (currentStep === 1) {
    if (!data.name.trim()) errors.name = "Name is required *";
    else if (!/^[A-Za-z\s]+$/.test(data.name)) errors.name = "Enter letters only";

    if (!data.department) errors.department = "Select a department *";
    if (!data.year) errors.year = "Select your current year *";
    if (!data.regsNumber.trim()) errors.regsNumber = "Registration number is required *";

    if (!data.yearOfStudy) errors.yearOfStudy = "Year of study is required *";
    else if (!/^\d{4}$/.test(data.yearOfStudy)) errors.yearOfStudy = "Must be a 4-digit number";

    if (!data.passOutYear) errors.passOutYear = "Pass out year is required *";
    else if (!/^\d{4}$/.test(data.passOutYear)) errors.passOutYear = "Must be a 4-digit number";
  }

  if (currentStep === 2) {
    if (!data.email.trim()) {
      errors.email = "Email is required *";
    } else {
      const emailRegex = /^[A-Z][a-zA-Z0-9._%+-]*@(gmail\.com|ksrce\.ac\.in)$/;
      if (!emailRegex.test(data.email)) {
        errors.email = "Must start with a CAPITAL letter and end with @gmail.com or @ksrce.ac.in";
      }
    }

    if (!data.phone) errors.phone = "Phone number is required *";
    else if (!/^\d{10}$/.test(data.phone)) errors.phone = "10 digits required";

    if (!data.alternativePhone) errors.alternativePhone = "Alternative phone number is required *";
    else if (!/^\d{10}$/.test(data.alternativePhone)) errors.alternativePhone = "10 digits required";

    if (!data.address.trim()) errors.address = "Address is required *";
    if (data.isOtherState && !data.stateName.trim()) errors.stateName = "State name is required *";

    if (!data.pinCode) errors.pinCode = "Pin code is required *";
    else if (!/^\d+$/.test(data.pinCode)) errors.pinCode = "Numbers only";

    if (!data.district.trim()) errors.district = "District is required *";
    else if (!/^[A-Za-z\s]+$/.test(data.district)) errors.district = "Letters only";
  }

  if (currentStep === 3) {
    if (!data.boardOfStudy) errors.boardOfStudy = "Select your board of study *";
    if (!data.graduationStanding) errors.graduationStanding = "Select your graduation standing *";

    const pctRegex = /^\d+(\.\d{1})?$/;

    if (!data.tenthPercentage) errors.tenthPercentage = "10th percentage is required *";
    else if (!pctRegex.test(data.tenthPercentage)) errors.tenthPercentage = "Format must look like 76.5 (1 decimal only)";

    if (!data.twelfthPercentage && !data.diplomaPercentage) errors.twelfthPercentage = "Fill either 12th or Diploma percentage *";
    if (data.twelfthPercentage && !pctRegex.test(data.twelfthPercentage)) errors.twelfthPercentage = "Format must look like 76.5";
    if (data.diplomaPercentage && !pctRegex.test(data.diplomaPercentage)) errors.diplomaPercentage = "Format must look like 76.5";

    if (data.graduationStanding === 'PG' && !data.ugCgpa) errors.ugCgpa = "UG CGPA is required for PG standing *";

    const requiredSems = getAllowedBoxesCount(data.year);
    for (let i = 0; i < requiredSems; i++) {
      if (!data.sgpaSemesterValues[i] || isNaN(parseFloat(data.sgpaSemesterValues[i]))) {
        errors.sgpaMatrix = `Please fill up all required ${requiredSems} semester fields *`;
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
  if (count === 0) return "0.00";
  
  let total = 0;
  let parsedCount = 0;
  for (let i = 0; i < count; i++) {
    const val = parseFloat(sems[i]);
    if (!isNaN(val)) {
      total += val;
      parsedCount++;
    }
  }
  return parsedCount > 0 ? (total / parsedCount).toFixed(2) : "0.00";
};