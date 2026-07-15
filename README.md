# LinkVoca

LinkVoca는 교재나 단어 페이지를 촬영하면 영어 단어를 추출하고, 사용자가 OCR 결과를 바로잡아 자신만의 이미지 연상 단어장과 복습 카드로 만드는 iPhone 우선 영어 학습 앱이다. 일반 영어, 수능, 토익, 간호·의학 영어를 지원 대상으로 삼는다.

## 현재 상태

- Expo SDK 54, React Native 0.81, TypeScript, Expo Router 기반 프로젝트
- `create-expo-app` 기본 탭 화면과 테마 코드가 남아 있는 초기 기획/기반 단계
- iPhone 우선 개발, Android 호환 목표
- OCR, 로컬 데이터베이스, 이미지 검색, AI 이미지 생성, 간격 반복은 아직 구현되지 않음
- 초기에는 로컬 우선으로 동작하고 계정 및 Supabase 동기화는 후속 단계에서 추가 예정

현재 설치된 의존성만으로는 카메라·앨범·SQLite·OCR 전체 흐름이 준비되어 있지 않다. 패키지 도입과 네이티브 OCR 선택은 각 Sprint에서 SDK 54 호환성을 확인한 뒤 별도 결정한다.

## 실행 방법

요구 환경은 Node.js 20.19 이상과 npm이다. iOS 시뮬레이터는 macOS가 필요하며, Windows에서는 Expo Go가 설치된 iPhone으로 같은 네트워크에서 확인할 수 있다.

```bash
npm install
npm start
```

실행 후 터미널의 QR 코드를 Expo Go로 스캔한다. 현재 프로젝트에서 사용할 수 있는 명령은 다음과 같다.

```bash
npm run ios
npm run android
npm run web
npm run lint
```

OCR처럼 Expo Go에 포함되지 않은 네이티브 모듈을 연결하는 단계부터는 development build가 필요할 수 있다. 전환 기준은 [아키텍처 문서](docs/ARCHITECTURE.md)에 정리되어 있다.

## 환경 변수

`.env.example`을 참고하되 실제 비밀값을 저장소에 커밋하지 않는다. `EXPO_PUBLIC_*` 변수는 앱 번들에서 읽을 수 있으므로 공개 가능한 설정에만 사용한다. 비밀 키는 향후 서버 또는 Supabase Edge Function에서 관리한다.

## 프로젝트 문서

- [제품 정의](docs/PRODUCT.md)
- [아키텍처](docs/ARCHITECTURE.md)
- [디자인 시스템](docs/DESIGN_SYSTEM.md)
- [데이터 모델](docs/DATABASE.md)
- [보안 및 개인정보](docs/SECURITY.md)
- [테스트 전략](docs/TESTING.md)
- [로드맵](docs/ROADMAP.md)
- [결정 기록](docs/DECISIONS.md)
- [에이전트 작업 지침](AGENTS.md)

Expo 구현은 [SDK 54 버전 문서](https://docs.expo.dev/versions/v54.0.0/)를 기준으로 한다.
