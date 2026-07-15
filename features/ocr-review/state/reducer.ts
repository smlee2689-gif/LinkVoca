import type {
  OcrReviewCandidate,
  OcrReviewState,
} from '@/features/ocr-review/types';
import {
  normalizeWordInput,
  toWordComparisonKey,
} from '@/features/ocr-review/validation';

export type OcrReviewAction =
  | Readonly<{ type: 'candidate/toggle-selected'; candidateId: string }>
  | Readonly<{ type: 'candidate/set-selected'; candidateId: string; isSelected: boolean }>
  | Readonly<{ type: 'candidate/edit'; candidateId: string; editedText: string }>
  | Readonly<{ type: 'candidate/exclude'; candidateId: string }>
  | Readonly<{ type: 'candidate/restore'; candidateId: string }>
  | Readonly<{
      type: 'candidate/add-manual';
      candidateId: string;
      editedText: string;
    }>
  | Readonly<{
      type: 'candidate/resolve-duplicate';
      candidateId: string;
      resolution: 'keep' | 'exclude';
    }>
  | Readonly<{ type: 'candidates/set-all-selected'; isSelected: boolean }>;

function updateCandidate(
  candidates: readonly OcrReviewCandidate[],
  candidateId: string,
  update: (candidate: OcrReviewCandidate) => OcrReviewCandidate,
): readonly OcrReviewCandidate[] {
  let hasUpdatedCandidate = false;

  return candidates.map((candidate) => {
    if (hasUpdatedCandidate || candidate.id !== candidateId) return candidate;

    hasUpdatedCandidate = true;
    const updatedCandidate = update(candidate);
    return updatedCandidate.isExcluded
      ? { ...updatedCandidate, isSelected: false }
      : updatedCandidate;
  });
}

function reconcileDuplicateAllowances(
  candidates: readonly OcrReviewCandidate[],
): readonly OcrReviewCandidate[] {
  const selectedCandidatesByKey = new Map<string, OcrReviewCandidate[]>();

  for (const candidate of candidates) {
    if (candidate.isExcluded || !candidate.isSelected) continue;
    const comparisonKey = toWordComparisonKey(candidate.editedText);
    if (comparisonKey.length === 0) continue;
    const group = selectedCandidatesByKey.get(comparisonKey) ?? [];
    group.push(candidate);
    selectedCandidatesByKey.set(comparisonKey, group);
  }

  return candidates.map((candidate) => {
    const comparisonKey = toWordComparisonKey(candidate.editedText);
    const group = selectedCandidatesByKey.get(comparisonKey) ?? [];
    const isResolvedGroup =
      group.length > 1 && group.every((groupCandidate) => groupCandidate.allowDuplicate);

    if (isResolvedGroup || !candidate.allowDuplicate) return candidate;
    return { ...candidate, allowDuplicate: false };
  });
}

export function ocrReviewReducer(
  state: OcrReviewState,
  action: OcrReviewAction,
): OcrReviewState {
  switch (action.type) {
    case 'candidate/toggle-selected':
      return {
        ...state,
        candidates: reconcileDuplicateAllowances(
          updateCandidate(state.candidates, action.candidateId, (candidate) => ({
            ...candidate,
            isSelected: candidate.isExcluded ? false : !candidate.isSelected,
          })),
        ),
      };
    case 'candidate/set-selected':
      return {
        ...state,
        candidates: reconcileDuplicateAllowances(
          updateCandidate(state.candidates, action.candidateId, (candidate) => ({
            ...candidate,
            isSelected: candidate.isExcluded ? false : action.isSelected,
          })),
        ),
      };
    case 'candidate/edit':
      return {
        ...state,
        candidates: reconcileDuplicateAllowances(
          updateCandidate(state.candidates, action.candidateId, (candidate) => ({
            ...candidate,
            editedText: action.editedText,
            allowDuplicate: false,
          })),
        ),
      };
    case 'candidate/exclude':
      return {
        ...state,
        candidates: reconcileDuplicateAllowances(
          updateCandidate(state.candidates, action.candidateId, (candidate) => ({
            ...candidate,
            isExcluded: true,
            isSelected: false,
            allowDuplicate: false,
          })),
        ),
      };
    case 'candidate/restore':
      return {
        ...state,
        candidates: reconcileDuplicateAllowances(
          updateCandidate(state.candidates, action.candidateId, (candidate) => ({
            ...candidate,
            isExcluded: false,
            isSelected: false,
            allowDuplicate: false,
          })),
        ),
      };
    case 'candidate/add-manual': {
      if (state.candidates.some((candidate) => candidate.id === action.candidateId)) {
        return state;
      }

      const nextSortOrder = state.candidates.reduce(
        (maximum, candidate) => Math.max(maximum, candidate.sortOrder),
        -1,
      ) + 1;
      const manualCandidate: OcrReviewCandidate = {
        id: action.candidateId,
        ocrJobId: state.job.id,
        origin: 'manual',
        rawText: null,
        editedText: normalizeWordInput(action.editedText),
        confidence: null,
        boundingBox: null,
        sortOrder: nextSortOrder,
        isSelected: true,
        isExcluded: false,
        allowDuplicate: false,
      };

      return {
        ...state,
        candidates: reconcileDuplicateAllowances([...state.candidates, manualCandidate]),
      };
    }
    case 'candidate/resolve-duplicate': {
      const targetCandidate = state.candidates.find(
        (candidate) => candidate.id === action.candidateId,
      );
      if (targetCandidate === undefined) return state;

      if (action.resolution === 'keep') {
        const comparisonKey = toWordComparisonKey(targetCandidate.editedText);
        return {
          ...state,
          candidates: reconcileDuplicateAllowances(
            state.candidates.map((candidate) =>
              !candidate.isExcluded &&
              candidate.isSelected &&
              comparisonKey.length > 0 &&
              toWordComparisonKey(candidate.editedText) === comparisonKey
                ? { ...candidate, allowDuplicate: true, isSelected: true }
                : candidate,
            ),
          ),
        };
      }

      return {
        ...state,
        candidates: reconcileDuplicateAllowances(
          updateCandidate(state.candidates, action.candidateId, (candidate) => ({
            ...candidate,
            allowDuplicate: false,
            isExcluded: true,
            isSelected: false,
          })),
        ),
      };
    }
    case 'candidates/set-all-selected':
      return {
        ...state,
        candidates: reconcileDuplicateAllowances(
          state.candidates.map((candidate) => ({
            ...candidate,
            isSelected: candidate.isExcluded ? false : action.isSelected,
          })),
        ),
      };
  }
}
