# 아키텍처

## 현재 기준선

현재 저장소는 Expo SDK 54, React Native 0.81, React 19.1, TypeScript strict, Expo Router 6의 기본 탭 템플릿이다. `app/`에는 샘플 화면만 있으며 카메라, 앨범, SQLite, OCR, 서버 SDK는 설치·구현되지 않았다. `app.json`의 typed routes, React Compiler, New Architecture 설정은 유지한다.

## 목표 구조

의존성 방향은 화면에서 인프라로 직접 연결하지 않고 다음 경계를 따른다.

```text
Expo Router 화면/컴포넌트
        ↓
use case (OCR 교정, 단어 저장, 복습 평가)
        ↓
repository interface / provider interface
        ↓
SQLite · 파일 저장소 · OCR · 사전 · 이미지 검색 · AI 이미지
```

- `app/`: 라우팅과 화면 조합. 비즈니스 규칙을 두지 않는다.
- `features/capture`: 촬영/앨범 선택, 이미지 전처리, 권한 UI
- `features/ocr`: 작업 상태, 후보 교정, OCR provider adapter
- `features/vocabulary`: 단어장, 단어 정보 편집, 이미지 선택
- `features/review`: 플래시카드, 평가, 간격 반복 계산
- `domain/`: 엔터티, 값 타입, use case, repository 계약
- `infrastructure/`: SQLite, 파일, HTTP provider, 향후 Supabase 구현

폴더는 실제 기능 구현 시 필요한 만큼 점진적으로 만든다. 문서상의 구조를 빈 파일로 먼저 복제하지 않는다.

## Expo Go 단계와 development build 단계

### 1단계: Expo Go

초기 UI와 도메인 흐름은 Expo Go에서 빠르게 검증한다. Expo Go에 포함된 SDK 54 호환 모듈 범위 안에서 이미지 선택, 권한 안내, mock OCR 응답, 교정 UI, 카드 UI, 순수 TypeScript 복습 알고리즘을 개발한다. 이 단계의 목적은 OCR 엔진 성능이 아니라 사용자 교정 흐름과 데이터 계약을 확정하는 것이다.

Expo Go는 고정된 네이티브 런타임이므로 앱 전용 네이티브 OCR 라이브러리를 임의로 추가할 수 없다. 네트워크 OCR provider를 쓰면 Expo Go에서도 adapter를 연결할 수 있지만, 사진 전송 동의·비밀 키 서버 보관·오프라인 제한을 먼저 해결해야 한다.

### 2단계: development build

다음 중 하나가 확정되면 development build로 전환한다.

- iOS Vision, ML Kit 등 Expo Go에 없는 사용자 정의 네이티브 OCR 모듈 채택
- config plugin 또는 네이티브 권한 설정을 실제 바이너리에 반영해야 함
- background 작업이나 네이티브 수준 성능을 실제 기기에서 검증해야 함

전환 시 SDK 54와 New Architecture 호환성을 확인하고, config plugin 설정을 재현 가능하게 유지한다. iPhone 실기기를 기준으로 development client를 만들고 Android 빌드도 같은 adapter 계약으로 확인한다.

## OCR 모듈 연결 시점

1. 먼저 `OcrProvider.recognize(input): Promise<OcrResult>` 계약과 fixture를 만든다.
2. 촬영/선택 → mock 결과 → 교정 → 확정 흐름과 오류 상태를 Expo Go에서 완성한다.
3. 대표 데이터셋(일반, 수능, 토익, 간호·의학, 2단 편집, 기울어진 사진)으로 후보 품질 기준을 정의한다.
4. 온디바이스와 서버 OCR을 개인정보, 정확도, 한국어 설명 비용, 오프라인, SDK 54 호환성으로 비교한다.
5. provider를 선택한 Sprint에서 실제 adapter를 연결한다. 네이티브 provider면 이때 development build로 전환한다.

OCR 원문은 곧바로 단어 엔터티가 아니다. `ocr_jobs`와 후보 상태로 저장하며 사용자의 확정 동작 이후에만 `words`를 생성한다.

## 로컬 우선 저장

- 구조화 데이터의 기준 저장소는 SQLite를 목표로 한다. 단어, OCR 작업, 이미지 출처, 학습 기록, 복습 일정을 한 트랜잭션 경계 안에서 관리한다.
- 촬영 원본과 전처리 이미지는 앱 전용 파일 디렉터리에 두고 DB에는 로컬 URI와 해시, 보존 상태만 저장한다.
- UI는 네트워크 응답이 아니라 로컬 repository를 구독한다. 외부 조회 결과는 먼저 로컬에 커밋한 뒤 화면에 반영한다.
- 모든 사용자 수정은 로컬에서 즉시 성공한다. API 실패는 단어 전체를 막지 않고 해당 enrichment 필드를 `pending/failed`로 둔다.
- 복습 평가는 로컬 트랜잭션으로 기록과 다음 일정을 함께 갱신하여 앱 종료 시 불일치를 막는다.
- 삭제는 원본 파일, 파생 파일, DB 참조를 정리하고 향후 동기화를 위해 tombstone을 남길 수 있게 설계한다.

## 외부 서비스 경계

`OcrProvider`, `DictionaryProvider`, `ImageSearchProvider`, `ImageGenerationProvider`를 각각 분리한다. provider 응답은 runtime validation 후 내부 모델로 정규화한다. 이미지 검색은 항상 우선이며 결과 없음/사용자 거절을 기록한 경우에만 AI 생성 호출을 허용한다. provider 비밀 키는 앱에서 직접 사용하지 않고 서버 프록시 또는 Supabase Edge Function을 통한다.

## 향후 Supabase 확장

로컬 DB의 ID는 처음부터 UUID로 생성하고 `created_at`, `updated_at`, `deleted_at`, `sync_status`, `version`을 둘 수 있게 한다. 인증 도입 후 repository 위에 동기화 coordinator를 추가한다.

1. 로그인 전 데이터는 로컬 소유자로 저장한다.
2. 로그인 시 사용자 확인 후 로컬 데이터를 한 계정으로 병합한다.
3. outbox에 로컬 변경을 쌓고 네트워크 복구 시 idempotency key와 함께 push한다.
4. 서버 변경은 cursor 기반으로 pull하고 로컬 트랜잭션으로 적용한다.
5. 충돌은 복습 기록은 append-only 병합, 단어 편집은 필드별 최신 버전 또는 사용자 선택, 삭제는 tombstone 우선으로 처리한다.
6. Supabase RLS로 `user_id = auth.uid()` 소유권을 강제하고 Storage도 사용자 prefix 정책을 적용한다.

동기화는 UI의 로컬 repository 계약을 바꾸지 않고 추가한다. 서비스 선택과 충돌 정책은 구현 전 `DECISIONS.md`에서 확정한다.
