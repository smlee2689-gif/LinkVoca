import type {
  OcrReviewCandidate,
  OcrReviewState,
} from '@/features/ocr-review/types';
import { normalizeWordInput } from '@/features/ocr-review/validation';

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

export function ocrReviewReducer(
  state: OcrReviewState,
  action: OcrReviewAction,
): OcrReviewState {
  switch (action.type) {
    case 'candidate/toggle-selected':
      return {
        ...state,
        candidates: updateCandidate(state.candidates, action.candidateId, (candidate) => ({
          ...candidate,
          isSelected: candidate.isExcluded ? false : !candidate.isSelected,
        })),
      };
    case 'candidate/set-selected':
      return {
        ...state,
        candidates: updateCandidate(state.candidates, action.candidateId, (candidate) => ({
          ...candidate,
          isSelected: candidate.isExcluded ? false : action.isSelected,
        })),
      };
    case 'candidate/edit':
      return {
        ...state,
        candidates: updateCandidate(state.candidates, action.candidateId, (candidate) => ({
          ...candidate,
          editedText: action.editedText,
          allowDuplicate: false,
        })),
      };
    case 'candidate/exclude':
      return {
        ...state,
        candidates: updateCandidate(state.candidates, action.candidateId, (candidate) => ({
          ...candidate,
          isExcluded: true,
          isSelected: false,
          allowDuplicate: false,
        })),
      };
    case 'candidate/restore':
      return {
        ...state,
        candidates: updateCandidate(state.candidates, action.candidateId, (candidate) => ({
          ...candidate,
          isExcluded: false,
          isSelected: false,
        })),
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

      return { ...state, candidates: [...state.candidates, manualCandidate] };
    }
    case 'candidate/resolve-duplicate':
      return {
        ...state,
        candidates: updateCandidate(state.candidates, action.candidateId, (candidate) =>
          action.resolution === 'keep'
            ? { ...candidate, allowDuplicate: true, isSelected: true, isExcluded: false }
            : { ...candidate, allowDuplicate: false, isSelected: false, isExcluded: true },
        ),
      };
    case 'candidates/set-all-selected':
      return {
        ...state,
        candidates: state.candidates.map((candidate) => ({
          ...candidate,
          isSelected: candidate.isExcluded ? false : action.isSelected,
        })),
      };
  }
}
