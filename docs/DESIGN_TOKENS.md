# 디자인 토큰 초안

이 값은 코드 구현 전 검증용 초안이다. 현재 앱 코드에는 적용하지 않는다. 이름은 의미 기반이며 특정 화면이나 색 이름을 토큰명에 넣지 않는다. 색 대비는 실제 글꼴·크기에서 WCAG AA를 검증한 뒤 확정한다.

## 색상 역할

| 토큰 | 라이트 | 다크 | 사용 목적 |
|---|---|---|---|
| `color.bg.canvas` | `#F7F8FA` | `#101318` | 앱 기본 배경 |
| `color.bg.surface` | `#FFFFFF` | `#191E25` | 카드, sheet, 입력 영역 |
| `color.bg.subtle` | `#EEF1F5` | `#242B34` | 그룹 배경, 비활성 영역 |
| `color.text.primary` | `#17202A` | `#F3F5F7` | 제목·본문 |
| `color.text.secondary` | `#5D6875` | `#B7C0CA` | 설명·메타데이터 |
| `color.text.disabled` | `#929BA5` | `#77818C` | 비활성 문구 |
| `color.action.primary` | `#3563E9` | `#7C9DFF` | 주요 CTA·선택 |
| `color.action.primaryPressed` | `#254DC0` | `#9AB3FF` | pressed 상태 |
| `color.action.onPrimary` | `#FFFFFF` | `#0C1738` | Primary 위 콘텐츠 |
| `color.feedback.success` | `#16856F` | `#54D3B6` | 저장·완료 |
| `color.feedback.warning` | `#A85D00` | `#FFB45C` | OCR 검토·주의 |
| `color.feedback.danger` | `#C73838` | `#FF8585` | 오류·삭제 |
| `color.feedback.info` | `#246B9E` | `#71B7E6` | 로컬 저장·안내 |
| `color.border.default` | `#D9DEE5` | `#39424D` | 카드·입력 테두리 |
| `color.border.focus` | `#3563E9` | `#9AB3FF` | 키보드/스크린리더 focus |
| `color.overlay` | `rgba(12,18,28,.48)` | `rgba(0,0,0,.64)` | modal·crop 바깥 영역 |

의료 주의와 OCR 주의는 같은 warning 색을 사용하더라도 각각 `십자 아이콘 + 학습 참고용`, `검토 아이콘 + 확인 필요` 문구로 의미를 구분한다.

## 타이포그래피

시스템 글꼴과 Dynamic Type을 사용한다. 표의 크기는 기본 콘텐츠 크기 기준이다.

| 토큰 | 크기/행간/굵기 | 용도 |
|---|---|---|
| `type.display` | 32/38, 700 | 플래시카드 영어 단어 |
| `type.title1` | 28/34, 700 | 화면 제목 |
| `type.title2` | 22/28, 600 | 큰 섹션·완료 결과 |
| `type.title3` | 20/26, 600 | 카드 제목 |
| `type.body` | 16/24, 400 | 기본 본문·입력 |
| `type.bodyStrong` | 16/24, 600 | 행 제목·강조 |
| `type.callout` | 15/22, 500 | 버튼·상태 문구 |
| `type.caption` | 14/20, 400 | 출처·도움말 |
| `type.captionSmall` | 12/17, 400 | 보조 메타데이터, 핵심 안내에는 사용 금지 |

영어 단어와 IPA는 글자 폭이 넓어도 축소하지 않고 줄바꿈 또는 수평 여유를 제공한다.

## 여백과 크기

| 토큰 | 값 | 사용 목적 |
|---|---:|---|
| `space.1` | 4 | 아이콘과 짧은 라벨 |
| `space.2` | 8 | 같은 그룹 내부 |
| `space.3` | 12 | 행 내부 |
| `space.4` | 16 | 카드 내부·그룹 간 |
| `space.5` | 20 | 화면 좌우 기본 여백 |
| `space.6` | 24 | 섹션 간 |
| `space.8` | 32 | 큰 구획 간 |
| `space.10` | 40 | 빈 상태 상하 여유 |

작은 iPhone에서도 화면 좌우 여백 16pt 아래로 줄이지 않는다. 하단 CTA 컨테이너는 safe area를 제외하고 위 12pt, 좌우 16pt를 사용한다.

## 모서리 반경

| 토큰 | 값 | 사용 목적 |
|---|---:|---|
| `radius.sm` | 8 | 작은 chip·상태 배지 |
| `radius.md` | 12 | 입력창·작은 카드 |
| `radius.lg` | 16 | 기본 콘텐츠 카드 |
| `radius.xl` | 24 | bottom sheet·큰 이미지 카드 |
| `radius.full` | 999 | pill·원형 버튼 |

## 그림자

그림자는 계층을 보조할 뿐 경계의 유일한 표현으로 사용하지 않는다.

| 토큰 | iOS 개념값 | Android elevation | 용도 |
|---|---|---:|---|
| `shadow.none` | 없음 | 0 | 기본 카드 |
| `shadow.low` | `0 1 3 / 10%` | 2 | 떠 있는 행·선택 카드 |
| `shadow.medium` | `0 6 18 / 14%` | 6 | bottom sheet·고정 CTA |

다크 모드에서는 그림자보다 `color.border.default`와 표면 차이를 우선한다.

## 컨트롤 토큰

| 토큰 | 값 | 용도 |
|---|---:|---|
| `control.button.small` | 44 | 보조 버튼 최소 높이 |
| `control.button.medium` | 50 | 기본 버튼 높이 |
| `control.button.large` | 56 | 하단 주요 CTA |
| `control.input.single` | 52 | 한 줄 입력 최소 높이 |
| `control.input.multiline` | 112 | 뜻·예문·연상 설명 입력 시작 높이 |
| `control.touch.minimum` | 44×44 | 모든 터치 대상 최소 영역 |
| `control.icon.small` | 16 | 배지·입력 보조 |
| `control.icon.medium` | 22 | 기본 탐색·행 액션 |
| `control.icon.large` | 28 | 탭·주요 액션 |
| `control.icon.hero` | 40 | 빈 상태·완료 상태, 장식용 |

## 라이트·다크 모드 규칙

- 시스템 설정을 기본으로 따르고 설정에서 `시스템/라이트/다크`를 선택할 수 있게 한다.
- 의미 토큰은 동일하게 유지하고 원시 hex를 화면에서 직접 사용하지 않는다.
- 사진과 검색 이미지는 임의로 어둡게 반전하지 않는다. 주변 표면과 테두리만 조정한다.
- 스켈레톤은 라이트 `#E4E8ED → #F2F4F7`, 다크 `#252C35 → #303944` 범위로 움직이며 모션 감소 시 정적 상태를 사용한다.
- 위험/성공 색 위 작은 글자는 피하고 아이콘·문구를 별도 표면 위에 둔다.
- 키보드, status bar, navigation bar도 현재 모드와 대비되게 설정할 것을 구현 체크리스트에 포함한다.
