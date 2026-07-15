export { ocrReviewReducer, type OcrReviewAction } from './reducer';
export {
  LOW_CONFIDENCE_THRESHOLD,
  selectActiveCandidates,
  selectCandidateValidations,
  selectCanCompleteReview,
  selectDuplicateGroups,
  selectLowConfidenceCandidateIds,
  selectSelectedCandidates,
  type CandidateValidation,
  type DuplicateGroup,
} from './selectors';

