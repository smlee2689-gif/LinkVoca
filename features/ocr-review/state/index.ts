export { ocrReviewReducer, type OcrReviewAction } from './reducer';
export {
  LOW_CONFIDENCE_THRESHOLD,
  selectActiveCandidates,
  selectAllCandidateValidations,
  selectCandidateValidations,
  selectCanCompleteReview,
  selectDuplicateGroups,
  selectLowConfidenceCandidateIds,
  selectSelectedCandidates,
  selectUnresolvedDuplicateGroups,
  type CandidateValidation,
  type DuplicateGroup,
} from './selectors';
