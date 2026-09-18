/**
 * Phone Number Validation Utility for Smriti-Setu (Noklai Memory Assistant)
 * 
 * Rules:
 * 1. Must add at least one number: either Patient OR Caregiver number.
 * 2. Any entered number must be an Indian mobile number (10 digits, starts with 6, 7, 8, or 9).
 * 3. Caregiver and Patient cannot share the same phone number.
 */

/**
 * Normalizes an Indian phone number string to a 10-digit string.
 * Strips whitespace, dashes, parens, and prefixes (+91, 91, 0).
 * Returns the 10-digit string if valid, or null if invalid.
 *
 * @param {string} phone
 * @returns {string|null}
 */
export function normalizeIndianPhone(phone) {
  if (!phone || typeof phone !== 'string') return null;

  // Strip all non-digit characters except leading '+'
  let cleaned = phone.trim().replace(/[\s\-\(\)\.\,\/]/g, '');

  // Strip leading '+'
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }

  // If 12 digits and starts with 91 (India country code), strip 91
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    cleaned = cleaned.substring(2);
  }

  // If 11 digits and starts with 0 (national trunk prefix), strip 0
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }

  // Must now be exactly 10 digits starting with 6, 7, 8, or 9
  const indianMobilePattern = /^[6-9]\d{9}$/;
  if (indianMobilePattern.test(cleaned)) {
    return cleaned;
  }

  return null;
}

/**
 * Checks whether a single non-empty phone string is a valid Indian mobile number.
 *
 * @param {string} phone
 * @returns {boolean}
 */
export function isValidIndianMobile(phone) {
  return normalizeIndianPhone(phone) !== null;
}

/**
 * Formats a 10-digit Indian phone number to standard display format (+91 XXXXX XXXXX).
 *
 * @param {string} phone
 * @returns {string}
 */
export function formatIndianPhone(phone) {
  const normalized = normalizeIndianPhone(phone);
  if (!normalized) return phone || '';
  return `+91 ${normalized.slice(0, 5)} ${normalized.slice(5)}`;
}

/**
 * Validates login requirements for Caregiver and Patient details:
 * - caregiverName: required
 * - patientName: required
 * - caregiverPhone / patientPhone: at least one must be provided
 * - any provided phone must be from India (10 digits starting with 6-9)
 * - caregiverPhone and patientPhone cannot be the same
 *
 * @param {Object} params
 * @param {string} params.caregiverName
 * @param {string} params.patientName
 * @param {string} params.caregiverPhone
 * @param {string} params.patientPhone
 * @returns {{
 *   isValid: boolean,
 *   errorMessage: string,
 *   errorField?: 'caregiverName' | 'patientName' | 'caregiverPhone' | 'patientPhone' | 'bothPhones' | 'phoneRequired',
 *   errorField?: 'caregiverName' | 'patientName' | 'caregiverPhone' | 'patientPhone' | 'bothPhones' | 'phoneRequired' | null,
 *   normalizedCaregiverPhone: string,
 *   normalizedPatientPhone: string,
 *   formattedCaregiverPhone: string,
 *   formattedPatientPhone: string
 * }}
 */
export function validateLoginRequirements({
  caregiverName = '',
  patientName = '',
  caregiverPhone = '',
  patientPhone = '',
}) {
  const cgNameTrimmed = (caregiverName || '').trim();
  const ptNameTrimmed = (patientName || '').trim();
  const cgPhoneTrimmed = (caregiverPhone || '').trim();
  const ptPhoneTrimmed = (patientPhone || '').trim();

  // Validate Names
  if (!cgNameTrimmed) {
    return {
      isValid: false,
      errorMessage: 'Please enter the caregiver name.',
      errorField: 'caregiverName',
      normalizedCaregiverPhone: '',
      normalizedPatientPhone: '',
      formattedCaregiverPhone: '',
      formattedPatientPhone: '',
    };
  }

  if (!ptNameTrimmed) {
    return {
      isValid: false,
      errorMessage: "Please enter the patient's name.",
      errorField: 'patientName',
      normalizedCaregiverPhone: '',
      normalizedPatientPhone: '',
      formattedCaregiverPhone: '',
      formattedPatientPhone: '',
    };
  }

  // Requirement 1: Must add either patient or caregiver number (at least one)
  if (!cgPhoneTrimmed && !ptPhoneTrimmed) {
    return {
      isValid: false,
      errorMessage: 'Please enter at least one contact number (either Patient or Caregiver mobile number).',
      errorField: 'phoneRequired',
      normalizedCaregiverPhone: '',
      normalizedPatientPhone: '',
      formattedCaregiverPhone: '',
      formattedPatientPhone: '',
    };
  }

  let normalizedCg = '';
  let normalizedPt = '';

  // Requirement 2: Number must be from India (if provided)
  if (cgPhoneTrimmed) {
    const cgNorm = normalizeIndianPhone(cgPhoneTrimmed);
    if (!cgNorm) {
      return {
        isValid: false,
        errorMessage: 'Caregiver number must be a valid 10-digit Indian mobile number (e.g. +91 98765 43210 or 9876543210).',
        errorField: 'caregiverPhone',
        normalizedCaregiverPhone: '',
        normalizedPatientPhone: '',
        formattedCaregiverPhone: '',
        formattedPatientPhone: '',
      };
    }
    normalizedCg = cgNorm;
  }

  if (ptPhoneTrimmed) {
    const ptNorm = normalizeIndianPhone(ptPhoneTrimmed);
    if (!ptNorm) {
      return {
        isValid: false,
        errorMessage: 'Patient number must be a valid 10-digit Indian mobile number (e.g. +91 98765 43210 or 9876543210).',
        errorField: 'patientPhone',
        normalizedCaregiverPhone: '',
        normalizedPatientPhone: '',
        formattedCaregiverPhone: '',
        formattedPatientPhone: '',
      };
    }
    normalizedPt = ptNorm;
  }

  // Requirement 3: No same number in both
  if (normalizedCg && normalizedPt && normalizedCg === normalizedPt) {
    return {
      isValid: false,
      errorMessage: 'Caregiver and Patient cannot share the same phone number. Please provide different numbers.',
      errorField: 'bothPhones',
      normalizedCaregiverPhone: '',
      normalizedPatientPhone: '',
      formattedCaregiverPhone: '',
      formattedPatientPhone: '',
    };
  }

  return {
    isValid: true,
    errorMessage: '',
    errorField: null,
    normalizedCaregiverPhone: normalizedCg,
    normalizedPatientPhone: normalizedPt,
    formattedCaregiverPhone: normalizedCg ? `+91 ${normalizedCg.slice(0, 5)} ${normalizedCg.slice(5)}` : '',
    formattedPatientPhone: normalizedPt ? `+91 ${normalizedPt.slice(0, 5)} ${normalizedPt.slice(5)}` : '',
  };
}

