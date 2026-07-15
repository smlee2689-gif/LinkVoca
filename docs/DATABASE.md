# 데이터 모델 초안

## 원칙

MVP의 기준 저장소는 로컬 SQLite이며, 촬영 파일은 앱 전용 파일 저장소에 둔다. 모든 ID는 향후 Supabase 병합을 고려해 UUID 문자열을 사용한다. 시간은 UTC ISO 8601로 저장하고 UI에서 로컬 시간으로 표시한다. 아래 모델은 논리 초안이며 실제 migration 도입 시 SQLite 타입과 인덱스를 확정한다.

## 관계 개요

```text
vocabulary_books 1 ── N words
vocabulary_books 1 ── N ocr_jobs 1 ── N ocr_candidates
words            1 ── N word_images
words            1 ── N review_schedules 1 ── N study_records
```

한 단어가 여러 단어장에 공유되는 구조보다 MVP에서는 단어장별 편집 독립성을 우선해 `words`가 `book_id`를 직접 가진다.

## `vocabulary_books` — 단어장

| 필드 | 의미 |
|---|---|
| `id` | UUID PK |
| `title` | 사용자가 정한 이름 |
| `category` | `general`, `csat`, `toeic`, `nursing_medical` |
| `description` | 선택 메모 |
| `word_count` | 캐시 값, 트랜잭션으로 유지하거나 쿼리 계산 |
| `created_at`, `updated_at` | 생성/수정 시각 |
| `deleted_at` | soft delete 및 향후 동기화 tombstone |
| `sync_status`, `version` | 향후 동기화용 선택 필드 |

인덱스: `updated_at`, `deleted_at`.

## `words` — 단어

| 필드 | 의미 |
|---|---|
| `id`, `book_id` | UUID PK, 단어장 FK |
| `term` | 사용자가 확정한 원형/표기 |
| `normalized_term` | 중복 비교용 소문자·공백 정규화 값 |
| `part_of_speech` | 품사 코드, 미확정 허용 |
| `meaning_ko` | 대표 한국어 뜻 |
| `pronunciation_ipa` | IPA 등 표시 문자열 |
| `audio_url` | 출처가 확인된 발음 URL, 선택 |
| `example_en`, `example_ko` | 영어 예문과 한국어 해석 |
| `mnemonic_ko` | 사용자 편집 가능한 연상 설명 |
| `domain` | 일반/수능/토익/간호·의학 문맥 |
| `source_ocr_candidate_id` | 유입 OCR 후보 추적, 직접 추가면 null |
| `enrichment_status` | `pending`, `partial`, `complete`, `failed` |
| `created_at`, `updated_at`, `deleted_at` | 수명주기 |

권장 제약: 활성 행에서 `(book_id, normalized_term)` 중복 경고. 동형어·품사 분리가 필요하면 사용자가 중복 저장을 명시적으로 선택할 수 있게 한다.

## `ocr_jobs`와 `ocr_candidates` — OCR 작업

`ocr_jobs`는 사진 처리 단위다.

| 필드 | 의미 |
|---|---|
| `id`, `book_id` | UUID PK, 대상 단어장 FK |
| `source_type` | `camera` 또는 `library` |
| `local_image_uri` | 앱 전용 원본/전처리 파일 URI |
| `image_sha256` | 중복·무결성 확인용 해시 |
| `status` | `queued`, `processing`, `needs_review`, `completed`, `failed` |
| `provider` | 실제 OCR 제공자 식별자, mock 포함 |
| `provider_request_id` | 장애 추적용, 개인정보 없는 값 |
| `error_code` | 사용자 메시지와 분리된 안정적 코드 |
| `retain_source` | 확정 후 원본 보존 여부 |
| `created_at`, `updated_at`, `completed_at` | 처리 시각 |

`ocr_candidates`는 원문과 사용자 교정을 분리한다.

| 필드 | 의미 |
|---|---|
| `id`, `ocr_job_id` | UUID PK, 작업 FK |
| `raw_text` | OCR 원문 후보 |
| `edited_text` | 사용자가 고친 값 |
| `normalized_text` | 중복 비교 값 |
| `confidence` | provider가 제공할 때만 0~1 |
| `bounding_box_json` | 원문 위치, provider 독립 형식 |
| `sort_order` | 읽기 순서 |
| `decision` | `pending`, `accepted`, `rejected` |
| `created_at`, `updated_at` | 수명주기 |

전체 OCR 응답 blob은 기본 보관하지 않는다. 디버깅에 필요하면 사용자 동의와 짧은 만료 정책을 별도로 둔다.

## `word_images` — 이미지와 출처

| 필드 | 의미 |
|---|---|
| `id`, `word_id` | UUID PK, 단어 FK |
| `kind` | `search` 또는 `ai_generated` |
| `provider` | 검색/생성 제공자 |
| `remote_url`, `local_uri` | 원격 출처와 캐시 파일 |
| `thumbnail_url` | 검색 썸네일, 선택 |
| `source_page_url` | 사용자가 확인할 원문 페이지 |
| `creator_name`, `creator_url` | 작가 표시 정보 |
| `license_name`, `license_url` | 라이선스 및 근거 URL |
| `attribution_text` | 화면에 표시할 출처 문구 |
| `generation_prompt` | 생성 이미지일 때 정제된 prompt, 개인정보 금지 |
| `is_primary` | 단어 대표 이미지 여부 |
| `created_at`, `deleted_at` | 수명주기 |

검색 이미지에는 출처 필드를 필수로 검증한다. AI 생성 이미지는 `kind` 라벨을 UI에도 표시한다.

## `study_records` — 학습 기록

각 평가를 수정하지 않는 append-only 이벤트로 남긴다.

| 필드 | 의미 |
|---|---|
| `id`, `word_id`, `schedule_id` | UUID PK 및 FK |
| `session_id` | 한 번의 복습 세션 묶음 |
| `rating` | `again`, `hard`, `good`, `easy` |
| `reviewed_at` | 평가 시각 |
| `response_ms` | 선택적 응답 시간, 과도한 행동 추적 금지 |
| `previous_due_at`, `next_due_at` | 일정 변경 감사 정보 |
| `algorithm_version` | 계산 재현을 위한 버전 |
| `idempotency_key` | 중복 기록 방지 및 동기화용 |

## `review_schedules` — 복습 일정

MVP에서는 단어당 활성 일정 하나를 둔다.

| 필드 | 의미 |
|---|---|
| `id`, `word_id` | UUID PK, word unique FK |
| `state` | `new`, `learning`, `review`, `relearning`, `suspended` |
| `due_at` | 다음 복습 시각 |
| `interval_days` | 현재 간격 |
| `ease_factor` | 선택 알고리즘 파라미터 |
| `repetitions`, `lapses` | 성공 반복/실패 횟수 |
| `last_reviewed_at` | 마지막 평가 시각 |
| `algorithm_version` | 일정 계산 버전 |
| `created_at`, `updated_at`, `version` | 수명주기/충돌 감지 |

평가 저장은 `study_records` insert와 `review_schedules` update를 한 로컬 트랜잭션에서 수행한다.

## 보존 및 삭제

- 사용자가 OCR 원본 보존을 끄면 단어 확정 후 로컬 원본과 파생 파일을 삭제하고 URI를 null 처리한다.
- 단어장 삭제는 하위 단어·이미지·일정을 함께 숨기고 캐시 파일을 정리한다. 향후 동기화 중이면 tombstone 전송 전까지 최소 메타데이터만 남긴다.
- 로그에는 단어 뜻 자체보다 안정적 오류 코드와 익명 작업 ID를 사용한다.
