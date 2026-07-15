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
  return selectActiveCandidates(state).map((candidate) => ({
    candidateId: candidate.id,
    result: validateWordInput(candidate.editedText),
  }));
}

/** Includes excluded candidates for diagnostics and data integrity checks. */
export function selectAllCandidateValidations(
  state: OcrReviewState,
): readonly CandidateValidation[] {
  return state.candidates.map((candidate) => ({
    candidateId: candidate.id,
    result: validateWordInput(candidate.editedText),
  }));
}

function groupDuplicateCandidates(
  candidates: readonly OcrReviewCandidate[],
): readonly DuplicateGroup[] {
  const candidateIdsByKey = new Map<string, string[]>();

  for (const candidate of candidates) {
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

function unresolvedDuplicateGroups(
  candidates: readonly OcrReviewCandidate[],
): readonly DuplicateGroup[] {
  const candidateById = new Map(candidates.map((candidate) => [candidate.id, candidate]));
  return groupDuplicateCandidates(candidates).filter((group) =>
    group.candidateIds.some(
      (candidateId) => candidateById.get(candidateId)?.allowDuplicate !== true,
    ),
  );
}

/** Returns every duplicate group, including duplicates the user chose to keep. */
export function selectDuplicateGroups(state: OcrReviewState): readonly DuplicateGroup[] {
  return groupDuplicateCandidates(selectActiveCandidates(state));
}

/** Returns only duplicate groups that still require a user decision. */
export function selectUnresolvedDuplicateGroups(
  state: OcrReviewState,
): readonly DuplicateGroup[] {
  return unresolvedDuplicateGroups(selectActiveCandidates(state));
}

/** Returns unresolved duplicates only when multiple selected candidates would be saved. */
export function selectSelectedUnresolvedDuplicateGroups(
  state: OcrReviewState,
): readonly DuplicateGroup[] {
  return unresolvedDuplicateGroups(selectSelectedCandidates(state));
}

export function selectLowConfidenceCandidateIds(
  state: OcrReviewState,
): readonly string[] {
  return selectActiveCandidates(state)
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
