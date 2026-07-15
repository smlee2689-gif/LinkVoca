import type {
  OcrReviewCandidate,
  OcrReviewState,
} from '@/features/ocr-review/types';
import {
  toWordComparisonKey,
  validateWordInput,
  type WordValidationResult,
} from '@/features/ocr-review/validation';

export const LOW_CONFIDENCE_THRESHOLD = 0.75;

export type CandidateValidation = Readonly<{
  candidateId: string;
  result: WordValidationResult;
}>;

export type DuplicateGroup = Readonly<{
  comparisonKey: string;
  candidateIds: readonly string[];
}>;

export function selectActiveCandidates(
  state: OcrReviewState,
): readonly OcrReviewCandidate[] {
  return state.candidates.filter((candidate) => !candidate.isExcluded);
}

export function selectSelectedCandidates(
  state: OcrReviewState,
): readonly OcrReviewCandidate[] {
  return state.candidates.filter(
    (candidate) => candidate.isSelected && !candidate.isExcluded,
  );
}

export function selectCandidateValidations(
  state: OcrReviewState,
): readonly CandidateValidation[] {
  return state.candidates.map((candidate) => ({
    candidateId: candidate.id,
    result: validateWordInput(candidate.editedText),
  }));
}

export function selectDuplicateGroups(state: OcrReviewState): readonly DuplicateGroup[] {
  const candidateIdsByKey = new Map<string, string[]>();

  for (const candidate of selectActiveCandidates(state)) {
    const comparisonKey = toWordComparisonKey(candidate.editedText);
    if (comparisonKey.length === 0) continue;

    const candidateIds = candidateIdsByKey.get(comparisonKey) ?? [];
    candidateIds.push(candidate.id);
    candidateIdsByKey.set(comparisonKey, candidateIds);
  }

  return [...candidateIdsByKey.entries()]
    .filter(([, candidateIds]) => candidateIds.length > 1)
    .map(([comparisonKey, candidateIds]) => ({ comparisonKey, candidateIds }));
}

export function selectLowConfidenceCandidateIds(
  state: OcrReviewState,
): readonly string[] {
  return state.candidates
    .filter(
      (candidate) =>
        candidate.confidence !== null && candidate.confidence < LOW_CONFIDENCE_THRESHOLD,
    )
    .map((candidate) => candidate.id);
}

export function selectCanCompleteReview(state: OcrReviewState): boolean {
  const selectedCandidates = selectSelectedCandidates(state);
  return (
    selectedCandidates.length > 0 &&
    selectedCandidates.every((candidate) => validateWordInput(candidate.editedText).isValid)
  );
}

