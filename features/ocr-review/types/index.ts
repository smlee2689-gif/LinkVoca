export type OcrJobStatus =
  | 'queued'
  | 'processing'
  | 'needs_review'
  | 'completed'
  | 'failed';

export type OcrSourceType = 'camera' | 'library';

export type OcrBoundingBox = Readonly<{
  x: number;
  y: number;
  width: number;
  height: number;
}>;

export type OcrJob = Readonly<{
  id: string;
  bookId: string;
  sourceType: OcrSourceType;
  localImageUri: string;
  status: OcrJobStatus;
  provider: string;
  createdAt: string;
  updatedAt: string;
}>;

export type OcrCandidateOrigin = 'ocr' | 'manual';

export type OcrReviewCandidate = Readonly<{
  id: string;
  ocrJobId: string;
  origin: OcrCandidateOrigin;
  /** Provider text is immutable. Manual candidates have no OCR source text. */
  rawText: string | null;
  /** The editable value shown to the user. */
  editedText: string;
  confidence: number | null;
  boundingBox: OcrBoundingBox | null;
  sortOrder: number;
  isSelected: boolean;
  isExcluded: boolean;
  /** Explicitly records that the user chose to retain a duplicate. */
  allowDuplicate: boolean;
}>;

export type OcrReviewState = Readonly<{
  job: OcrJob;
  candidates: readonly OcrReviewCandidate[];
}>;
