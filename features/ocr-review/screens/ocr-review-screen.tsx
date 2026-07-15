import { router } from 'expo-router';
import { useMemo, useReducer, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  WordCandidateRow,
} from '@/features/ocr-review/components/word-candidate-row';
import { WordInputModal } from '@/features/ocr-review/components/word-input-modal';
import { mockOcrReviewState } from '@/features/ocr-review/fixtures/mock-ocr-review';
import { ocrReviewReducer } from '@/features/ocr-review/state/reducer';
import {
  selectActiveCandidates,
  selectCandidateValidations,
  selectCanCompleteReview,
  selectDuplicateGroups,
  selectLowConfidenceCandidateIds,
  selectSelectedCandidates,
  selectSelectedUnresolvedDuplicateGroups,
} from '@/features/ocr-review/state/selectors';
import { ocrReviewColors } from '@/features/ocr-review/theme';
import type { OcrReviewCandidate } from '@/features/ocr-review/types';
import { toWordComparisonKey, validateWordInput } from '@/features/ocr-review/validation';

type InputModalState =
  | Readonly<{ mode: 'closed' }>
  | Readonly<{ mode: 'add' }>
  | Readonly<{ mode: 'edit'; candidateId: string }>;

function validationMessage(candidate: OcrReviewCandidate): string | null {
  const result = validateWordInput(candidate.editedText);
  if (result.isValid) return null;
  return result.errorCode === 'required'
    ? '단어를 입력해 주세요.'
    : '영문자와 단일 공백, 하이픈, apostrophe만 사용할 수 있어요.';
}

export function OcrReviewScreen() {
  const colorScheme = useColorScheme();
  const colors = ocrReviewColors[colorScheme === 'dark' ? 'dark' : 'light'];
  const [state, dispatch] = useReducer(ocrReviewReducer, mockOcrReviewState);
  const [isSourceExpanded, setIsSourceExpanded] = useState(false);
  const [inputModal, setInputModal] = useState<InputModalState>({ mode: 'closed' });
  const manualCandidateSequence = useRef(0);

  const activeCandidates = selectActiveCandidates(state);
  const selectedCandidates = selectSelectedCandidates(state);
  const candidateValidations = selectCandidateValidations(state);
  const duplicateGroups = selectDuplicateGroups(state);
  const selectedUnresolvedDuplicateGroups = selectSelectedUnresolvedDuplicateGroups(state);
  const lowConfidenceCandidateIds = selectLowConfidenceCandidateIds(state);

  const validationByCandidateId = useMemo(
    () => new Map(candidateValidations.map((validation) => [validation.candidateId, validation.result])),
    [candidateValidations],
  );
  const lowConfidenceIds = useMemo(
    () => new Set(lowConfidenceCandidateIds),
    [lowConfidenceCandidateIds],
  );
  const duplicateIds = useMemo(
    () => new Set(duplicateGroups.flatMap((group) => group.candidateIds)),
    [duplicateGroups],
  );
  const selectedUnresolvedDuplicateIds = useMemo(
    () => new Set(selectedUnresolvedDuplicateGroups.flatMap((group) => group.candidateIds)),
    [selectedUnresolvedDuplicateGroups],
  );
  const candidateById = useMemo(
    () => new Map(state.candidates.map((candidate) => [candidate.id, candidate])),
    [state.candidates],
  );
  const duplicateResolutionByRepresentativeId = useMemo(
    () =>
      new Map(
        selectedUnresolvedDuplicateGroups.map((group) => {
          const representativeId = group.candidateIds[0];
          const terms = group.candidateIds.flatMap((candidateId) => {
            const candidate = candidateById.get(candidateId);
            return candidate === undefined ? [] : [candidate.editedText];
          });
          return [representativeId, { terms }] as const;
        }),
      ),
    [candidateById, selectedUnresolvedDuplicateGroups],
  );

  const editingCandidate =
    inputModal.mode === 'edit'
      ? state.candidates.find((candidate) => candidate.id === inputModal.candidateId) ?? null
      : null;
  const modalInitialValue = editingCandidate?.editedText ?? '';
  const selectedValidationErrorCount = selectedCandidates.filter(
    (candidate) => !validationByCandidateId.get(candidate.id)?.isValid,
  ).length;
  const selectedIds = new Set(selectedCandidates.map((candidate) => candidate.id));
  const selectedLowConfidenceCount = lowConfidenceCandidateIds.filter((candidateId) =>
    selectedIds.has(candidateId),
  ).length;
  const canComplete =
    selectCanCompleteReview(state) && selectedUnresolvedDuplicateGroups.length === 0;
  const areAllActiveCandidatesSelected =
    activeCandidates.length > 0 && activeCandidates.every((candidate) => candidate.isSelected);

  const completionMessage =
    selectedValidationErrorCount > 0
      ? `철자를 확인해야 하는 단어가 ${selectedValidationErrorCount}개 있어요.`
      : selectedUnresolvedDuplicateGroups.length > 0
        ? '중복 단어의 저장 방법을 선택해 주세요.'
        : selectedCandidates.length === 0
          ? '저장할 단어를 하나 이상 선택해 주세요.'
          : null;

  function createManualCandidateId(): string {
    let candidateId: string;
    do {
      manualCandidateSequence.current += 1;
      candidateId = `manual-candidate-${manualCandidateSequence.current}`;
    } while (state.candidates.some((candidate) => candidate.id === candidateId));
    return candidateId;
  }

  function findDuplicateCandidateIds(candidateId: string): readonly string[] {
    return (
      selectedUnresolvedDuplicateGroups.find((group) =>
        group.candidateIds.includes(candidateId),
      )?.candidateIds ?? []
    );
  }

  function keepOnlyCandidate(candidateId: string) {
    dispatch({
      type: 'candidate/resolve-duplicate',
      candidateId,
      resolution: 'keep',
    });
    for (const duplicateCandidateId of findDuplicateCandidateIds(candidateId)) {
      if (duplicateCandidateId !== candidateId) {
        dispatch({
          type: 'candidate/resolve-duplicate',
          candidateId: duplicateCandidateId,
          resolution: 'exclude',
        });
      }
    }
  }

  function keepAllDuplicateCandidates(candidateId: string) {
    dispatch({
      type: 'candidate/resolve-duplicate',
      candidateId,
      resolution: 'keep',
    });
  }

  const listHeader = (
    <View style={styles.listHeader}>
      <View style={styles.headerRow}>
        <Pressable
          accessibilityLabel="이전 화면으로 돌아가기"
          accessibilityRole="button"
          hitSlop={4}
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.65 : 1 }]}>
          <Text style={[styles.backSymbol, { color: colors.text }]}>‹</Text>
        </Pressable>
        <View style={styles.titleGroup}>
          <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
            찾은 단어 확인
          </Text>
          <Text style={[styles.candidateCount, { color: colors.secondaryText }]}>
            {state.candidates.length}개 중 {selectedCandidates.length}개 선택됨
          </Text>
        </View>
      </View>
      <Text style={[styles.description, { color: colors.secondaryText }]}>
        저장하기 전에 잘못 인식된 단어를 확인하세요.
      </Text>

      <View style={[styles.sourceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Pressable
          accessibilityLabel={`원본 페이지 ${isSourceExpanded ? '접기' : '보기'}`}
          accessibilityRole="button"
          accessibilityState={{ expanded: isSourceExpanded }}
          onPress={() => setIsSourceExpanded((value) => !value)}
          style={styles.sourceHeader}>
          <View
            style={[styles.sourceThumbnail, { backgroundColor: colors.subtle }]}>
            <Text style={[styles.thumbnailText, { color: colors.secondaryText }]}>Aa</Text>
          </View>
          <Text style={[styles.sourceTitle, { color: colors.text }]}>원본 페이지</Text>
          <Text style={[styles.expandLabel, { color: colors.primary }]}>
            {isSourceExpanded ? '접기' : '원본 보기'}
          </Text>
        </Pressable>
        {isSourceExpanded ? (
          <View
            accessible
            accessibilityLabel="원본 페이지 Mock 이미지 placeholder"
            style={[styles.sourcePlaceholder, { backgroundColor: colors.subtle }]}>
            <Text style={[styles.placeholderText, { color: colors.secondaryText }]}>
              administer · patlent · follow-up · dosage
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.toolActions}>
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            dispatch({
              type: 'candidates/set-all-selected',
              isSelected: !areAllActiveCandidatesSelected,
            })
          }
          style={({ pressed }) => [styles.toolButton, { opacity: pressed ? 0.65 : 1 }]}>
          <Text style={[styles.toolButtonText, { color: colors.primary }]}>
            {areAllActiveCandidatesSelected ? '모두 해제' : '모두 선택'}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => setInputModal({ mode: 'add' })}
          style={({ pressed }) => [styles.toolButton, { opacity: pressed ? 0.65 : 1 }]}>
          <Text style={[styles.toolButtonText, { color: colors.primary }]}>＋ 단어 직접 추가</Text>
        </Pressable>
      </View>

      {selectedLowConfidenceCount > 0 ? (
        <View
          accessible
          accessibilityRole="alert"
          style={[styles.warningBanner, { backgroundColor: colors.warningSurface }]}>
          <Text style={[styles.warningText, { color: colors.warning }]}>
            OCR 결과를 확인할 단어가 {selectedLowConfidenceCount}개 있어요. 저장은 계속할 수 있어요.
          </Text>
        </View>
      ) : null}

      <Text accessibilityRole="header" style={[styles.sectionTitle, { color: colors.text }]}>
        단어 후보
      </Text>
    </View>
  );

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.safeArea, { backgroundColor: colors.canvas }]}>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={state.candidates}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyboardShouldPersistTaps="handled"
        keyExtractor={(candidate) => candidate.id}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>찾은 단어가 없어요</Text>
            <Text style={[styles.emptyBody, { color: colors.secondaryText }]}>
              원본 이미지를 다시 확인하거나 단어를 직접 추가해 주세요.
            </Text>
          </View>
        }
        ListHeaderComponent={listHeader}
        style={styles.list}
        renderItem={({ item }) => {
          const duplicateResolution = duplicateResolutionByRepresentativeId.get(item.id);
          return (
            <WordCandidateRow
              candidate={item}
              colors={colors}
              duplicateGroupTerms={duplicateResolution?.terms ?? []}
              hasLowConfidence={lowConfidenceIds.has(item.id)}
              isDuplicate={duplicateIds.has(item.id)}
              isUnresolvedDuplicate={selectedUnresolvedDuplicateIds.has(item.id)}
              onEdit={() => setInputModal({ mode: 'edit', candidateId: item.id })}
              onExclude={() => dispatch({ type: 'candidate/exclude', candidateId: item.id })}
              onKeepDuplicates={() => keepAllDuplicateCandidates(item.id)}
              onKeepOnlyThis={() => keepOnlyCandidate(item.id)}
              onRestore={() => dispatch({ type: 'candidate/restore', candidateId: item.id })}
              onToggleSelected={() =>
                dispatch({ type: 'candidate/toggle-selected', candidateId: item.id })
              }
              showsDuplicateResolution={duplicateResolution !== undefined}
              validationMessage={validationMessage(item)}
            />
          );
        }}
      />

      <View style={[styles.ctaContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {completionMessage !== null ? (
          <Text accessibilityRole="alert" style={[styles.completionMessage, { color: colors.danger }]}>
            {completionMessage}
          </Text>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !canComplete }}
          disabled={!canComplete}
          onPress={() =>
            Alert.alert(
              'Mock 검토 완료',
              `${selectedCandidates.length}개 단어를 검토했어요. 실제 저장은 아직 연결되지 않았어요.`,
            )
          }
          style={({ pressed }) => [
            styles.primaryButton,
            {
              backgroundColor: canComplete
                ? pressed
                  ? colors.primaryPressed
                  : colors.primary
                : colors.subtle,
            },
          ]}>
          <Text
            style={[
              styles.primaryButtonText,
              { color: canComplete ? colors.onPrimary : colors.disabledText },
            ]}>
            {selectedCandidates.length}개 단어로 계속
          </Text>
        </Pressable>
      </View>

      <WordInputModal
        colors={colors}
        getDuplicateMessage={(value) => {
          const comparisonKey = toWordComparisonKey(value);
          if (comparisonKey.length === 0) return null;
          const duplicateCount = activeCandidates.filter(
            (candidate) =>
              candidate.id !== editingCandidate?.id &&
              toWordComparisonKey(candidate.editedText) === comparisonKey,
          ).length;
          return duplicateCount > 0
            ? inputModal.mode === 'edit'
              ? `같은 단어가 ${duplicateCount}개 있어요. 저장 후 유지할 항목을 선택할 수 있어요.`
              : `같은 단어가 ${duplicateCount}개 있어요. 추가 후 유지할 항목을 선택할 수 있어요.`
            : null;
        }}
        initialValue={modalInitialValue}
        mode={inputModal.mode === 'edit' ? 'edit' : 'add'}
        onCancel={() => setInputModal({ mode: 'closed' })}
        onSubmit={(normalizedText) => {
          if (inputModal.mode === 'edit') {
            dispatch({
              type: 'candidate/edit',
              candidateId: inputModal.candidateId,
              editedText: normalizedText,
            });
          } else if (inputModal.mode === 'add') {
            dispatch({
              type: 'candidate/add-manual',
              candidateId: createManualCandidateId(),
              editedText: normalizedText,
            });
          }
          setInputModal({ mode: 'closed' });
        }}
        rawText={editingCandidate?.rawText ?? null}
        visible={inputModal.mode !== 'closed'}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  listHeader: {
    gap: 16,
    paddingBottom: 16,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingTop: 4,
  },
  backButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  backSymbol: {
    fontSize: 38,
    lineHeight: 40,
  },
  titleGroup: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  },
  candidateCount: {
    fontSize: 14,
    lineHeight: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  sourceCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sourceHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sourceTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  sourceThumbnail: {
    alignItems: 'center',
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    width: 52,
  },
  thumbnailText: {
    fontSize: 14,
    fontWeight: '600',
  },
  expandLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  sourcePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 112,
    padding: 20,
  },
  placeholderText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  toolActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  toolButton: {
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 8,
  },
  toolButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  warningBanner: {
    borderRadius: 12,
    padding: 12,
  },
  warningText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 26,
  },
  separator: {
    height: 12,
  },
  emptyState: {
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 26,
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  ctaContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  completionMessage: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  primaryButton: {
    alignItems: 'center',
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
    textAlign: 'center',
  },
});
