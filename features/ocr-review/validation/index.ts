export type WordValidationErrorCode = 'required' | 'invalid_characters';

export type WordValidationResult =
  | Readonly<{ isValid: true; normalizedText: string }>
  | Readonly<{
      isValid: false;
      normalizedText: string;
      errorCode: WordValidationErrorCode;
    }>;

export type WordValidationPolicy = Readonly<{
  isValid: (normalizedText: string) => boolean;
}>;

const GENERAL_ENGLISH_PATTERN = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;

export const generalEnglishValidationPolicy: WordValidationPolicy = {
  isValid: (normalizedText) => GENERAL_ENGLISH_PATTERN.test(normalizedText),
};

/** Cleans display input without changing letter casing chosen by the user. */
export function normalizeWordInput(input: string): string {
  return input
    .normalize('NFC')
    .replace(/[\u2018\u2019]/g, "'")
    .trim()
    .replace(/\s+/g, ' ');
}

/** Produces the stable comparison key used for duplicate detection. */
export function toWordComparisonKey(input: string): string {
  return normalizeWordInput(input).toLocaleLowerCase('en-US');
}

export function validateWordInput(
  input: string,
  policy: WordValidationPolicy = generalEnglishValidationPolicy,
): WordValidationResult {
  const normalizedText = normalizeWordInput(input);

  if (normalizedText.length === 0) {
    return { isValid: false, normalizedText, errorCode: 'required' };
  }

  if (!policy.isValid(normalizedText)) {
    return { isValid: false, normalizedText, errorCode: 'invalid_characters' };
  }

  return { isValid: true, normalizedText };
}
