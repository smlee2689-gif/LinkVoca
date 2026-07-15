# 테스트 전략

## 목표

LinkVoca 테스트는 OCR 숫자 정확도만 보지 않는다. 사용자가 잘못된 후보를 고쳐 안전하게 저장할 수 있는지, 외부 API가 부분 실패해도 데이터가 남는지, 복습 일정이 결정적으로 계산되는지를 우선 검증한다.

## 테스트 층

### 정적 검증

- `npm run lint`
- `npx tsc --noEmit`
- migration/schema 검증 도입 후 FK, unique, cascade/tombstone 규칙 검사

### 단위 테스트

- OCR 후보 정규화: 대소문자, 하이픈, apostrophe, 줄바꿈, 번호/기호 제거
- 중복 판정과 사용자의 중복 허용
- provider 응답 validation 및 오류 코드 매핑
- 이미지 검색 우선, 검색 결과 거절 후에만 AI 생성 허용하는 규칙
- `again/hard/good/easy`별 간격 계산, 날짜 경계, 알고리즘 버전
- 의학/일반 의미 라벨과 미확정 필드 처리

시간과 UUID를 주입 가능하게 만들어 결과를 재현한다.

### 통합 테스트

- SQLite repository의 단어장 생성, OCR 작업 복원, 단어 확정 transaction
- 학습 기록 insert와 복습 일정 update의 원자성
- 앱 종료 후 pending/failed enrichment 재시도
- 원본 삭제 시 DB 참조와 로컬 파일 정리
- provider adapter의 성공, timeout, 429, 잘못된 JSON, 부분 필드 응답
- 향후 Supabase RLS: 본인 데이터 CRUD 허용, 타인 데이터 거부, tombstone 동기화

외부 API는 기본 테스트에서 mock server/fixture를 사용하고 실제 provider smoke test는 제한된 별도 환경에서 실행한다.

### 핵심 흐름 테스트

1. 새 단어장 → 앨범 이미지 → OCR → 후보 수정/삭제/추가 → 5개 단어 저장
2. 카메라 권한 거부 → 안내 → 설정 또는 앨범 대안
3. OCR 결과 없음 → 재촬영/직접 추가
4. 이미지 검색 선택 및 출처 확인 → 검색 부적합 → AI 생성 명시적 요청
5. 오프라인에서 단어 편집/복습 → 재실행 후 동일 데이터/일정 확인
6. `다시/어려움/보통/쉬움` 평가 후 예상 due date 및 실행 취소
7. 단어장 삭제 → 사진, 이미지 캐시, 학습 데이터 삭제 확인

## OCR 대표 데이터셋

실제 사용자 사진 대신 배포 가능한 합성/허가 자료로 다음 조건을 구성한다.

- 일반·수능·토익·간호·의학 단어 각 범주
- serif/sans-serif, 굵기, 작은 글자, 1단/2단 편집
- 기울기, 그림자, 빛 반사, 흐림, 낮은 대비
- 품사 약어, 발음기호, 번호가 단어와 섞인 페이지
- `follow-up`, `patient's`, 유사 문자(`I/l`, `rn/m`) 등 경계 사례

지표는 후보 recall, 확정 후 precision, 사용자 수정/삭제 횟수, 처리 시간으로 나눈다. provider confidence만으로 자동 확정하지 않는다.

## 기기 매트릭스

- 우선: 현재 지원 대상 iPhone 실기기, 최신 iOS 및 SDK 54 최소 지원 iOS 경계 중 확보 가능한 기기
- 보조: iOS Simulator에서 레이아웃·라우팅·DB, 실제 카메라는 실기기
- 호환: 소형/대형 Android 각 1종, 권한 거부, edge-to-edge, 시스템 뒤로 가기, 파일 URI 확인
- 공통: 라이트/다크, Dynamic Type 큰 크기, VoiceOver/TalkBack, 오프라인/느린 네트워크

## Sprint 완료 기준

- 해당 인수 조건과 오류/취소 경로가 통과한다.
- lint와 타입 검사가 통과하고 새 도메인 규칙에 단위 테스트가 있다.
- 사용자 사진이나 비밀 키가 fixture, snapshot, 로그에 없다.
- iOS 우선 검증 결과와 Android에서 남은 차이를 기록한다.
- 실행하지 않은 테스트와 이유를 PR/완료 보고에 명시한다.
