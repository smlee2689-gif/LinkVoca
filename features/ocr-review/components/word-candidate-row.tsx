import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { OcrReviewColors } from '@/features/ocr-review/theme';
import type { OcrReviewCandidate } from '@/features/ocr-review/types';

type WordCandidateRowProps = Readonly<{
  candidate: OcrReviewCandidate;
  colors: OcrReviewColors;
  hasLowConfidence: boolean;
  isDuplicate: boolean;
  isUnresolvedDuplicate: boolean;
  showsDuplicateResolution: boolean;
  duplicateGroupTerms: readonly string[];
  validationMessage: string | null;
  onToggleSelected: () => void;
  onEdit: () => void;
  onExclude: () => void;
  onRestore: () => void;
  onKeepDuplicates: () => void;
  onKeepOnlyThis: () => void;
}>;

type StatusLabelProps = Readonly<{
  label: string;
  accessibilityLabel: string;
  backgroundColor: string;
  color: string;
}>;

function StatusLabel({
  label,
  accessibilityLabel,
  backgroundColor,
  color,
}: StatusLabelProps) {
  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      style={[styles.statusLabel, { backgroundColor }]}>
      <Text style={[styles.statusLabelText, { color }]}>{label}</Text>
    </View>
  );
}

export function WordCandidateRow({
  candidate,
  colors,
  hasLowConfidence,
  isDuplicate,
  isUnresolvedDuplicate,
  showsDuplicateResolution,
  duplicateGroupTerms,
  validationMessage,
  onToggleSelected,
  onEdit,
  onExclude,
  onRestore,
  onKeepDuplicates,
  onKeepOnlyThis,
}: WordCandidateRowProps) {
  const displayText = candidate.editedText || '빈 단어';
  const isModified = candidate.rawText !== null && candidate.rawText !== candidate.editedText;
  const needsInputReview = validationMessage !== null || hasLowConfidence;
  const secondaryDescription = candidate.isExcluded
    ? '저장 대상에서 제외됨'
    : candidate.origin === 'manual'
      ? '직접 추가한 단어'
      : isModified
        ? `수정됨 · OCR 원문: ${candidate.rawText}`
        : hasLowConfidence
          ? `OCR 원문: ${candidate.rawText}`
          : null;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: candidate.isExcluded ? colors.subtle : colors.surface,
          borderColor: colors.border,
          opacity: candidate.isExcluded ? 0.72 : 1,
        },
      ]}>
      <View style={styles.mainRow}>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: candidate.isSelected, disabled: candidate.isExcluded }}
          accessibilityLabel={`${displayText} ${candidate.isSelected ? '선택됨' : '선택 안 됨'}`}
          disabled={candidate.isExcluded}
          hitSlop={4}
          onPress={onToggleSelected}
          style={({ pressed }) => [
            styles.checkButton,
            {
              backgroundColor: candidate.isSelected ? colors.primary : colors.surface,
              borderColor: candidate.isSelected ? colors.primary : colors.border,
              opacity: candidate.isExcluded ? 0.45 : pressed ? 0.7 : 1,
            },
          ]}>
          <Text
            style={[
              styles.checkMark,
              { color: candidate.isSelected ? colors.onPrimary : colors.text },
            ]}>
            {candidate.isSelected ? '✓' : ''}
          </Text>
        </Pressable>

        <View style={styles.wordContent}>
          <Text
            selectable
            style={[
              styles.word,
              { color: candidate.isExcluded ? colors.disabledText : colors.text },
            ]}>
            {displayText}
          </Text>
          {secondaryDescription !== null ? (
            <Text selectable style={[styles.secondaryDescription, { color: colors.secondaryText }]}>
              {secondaryDescription}
            </Text>
          ) : null}
          <View style={styles.statuses}>
            {needsInputReview ? (
              <StatusLabel
                accessibilityLabel={
                  validationMessage !== null
                    ? '입력 오류를 확인해야 하는 단어'
                    : 'OCR 신뢰도가 낮아 확인이 필요한 단어'
                }
                backgroundColor={colors.warningSurface}
                color={validationMessage !== null ? colors.danger : colors.warning}
                label={validationMessage !== null ? '입력 확인' : '확인 필요'}
              />
            ) : null}
            {isDuplicate ? (
              <StatusLabel
                accessibilityLabel={
                  isUnresolvedDuplicate
                    ? '선택된 중복 후보이며 저장 방법을 결정해야 함'
                    : '중복 후보'
                }
                backgroundColor={colors.subtle}
                color={colors.secondaryText}
                label={
                  isUnresolvedDuplicate
                    ? showsDuplicateResolution
                      ? '중복 · 결정 필요'
                      : '같은 단어'
                    : '중복'
                }
              />
            ) : null}
          </View>
        </View>

        {candidate.isExcluded ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${displayText} 저장 대상으로 복원`}
            onPress={onRestore}
            style={({ pressed }) => [styles.trailingButton, { opacity: pressed ? 0.65 : 1 }]}>
            <Text style={[styles.trailingButtonLabel, { color: colors.primary }]}>복원</Text>
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${displayText} 편집`}
            onPress={onEdit}
            style={({ pressed }) => [styles.trailingButton, { opacity: pressed ? 0.65 : 1 }]}>
            <Text style={[styles.trailingButtonLabel, { color: colors.primary }]}>편집</Text>
          </Pressable>
        )}
      </View>

      {validationMessage !== null && !candidate.isExcluded ? (
        <Text accessibilityRole="alert" style={[styles.message, { color: colors.danger }]}>
          {validationMessage}
        </Text>
      ) : null}

      {showsDuplicateResolution && candidate.isSelected && !candidate.isExcluded ? (
        <View style={[styles.duplicateActions, { borderTopColor: colors.border }]}>
          <Text style={[styles.duplicateHint, { color: colors.secondaryText }]}>
            같은 단어 {duplicateGroupTerms.length}개: {duplicateGroupTerms.join(' · ')}
          </Text>
          <View style={styles.duplicateButtons}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${displayText}을 포함한 같은 단어 모두 저장`}
              onPress={onKeepDuplicates}
              style={({ pressed }) => [styles.actionButton, { opacity: pressed ? 0.65 : 1 }]}>
              <Text style={[styles.actionButtonText, { color: colors.primary }]}>
                {duplicateGroupTerms.length === 2 ? '둘 다 저장' : '모두 저장'}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${displayText}만 저장하고 다른 같은 단어 제외`}
              onPress={onKeepOnlyThis}
              style={({ pressed }) => [styles.actionButton, { opacity: pressed ? 0.65 : 1 }]}>
              <Text style={[styles.actionButtonText, { color: colors.secondaryText }]}>이 단어만 저장</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {!candidate.isExcluded ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${displayText} 저장 대상에서 제외`}
          onPress={onExclude}
          style={({ pressed }) => [styles.excludeButton, { opacity: pressed ? 0.65 : 1 }]}>
          <Text style={[styles.excludeText, { color: colors.secondaryText }]}>이 단어 제외</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    padding: 14,
  },
  mainRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
  },
  checkButton: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 2,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  checkMark: {
    fontSize: 20,
    fontWeight: '700',
  },
  wordContent: {
    flex: 1,
    gap: 3,
    minWidth: 0,
    paddingTop: 2,
  },
  word: {
    fontSize: 19,
    fontWeight: '600',
    lineHeight: 27,
  },
  secondaryDescription: {
    fontSize: 13,
    lineHeight: 19,
  },
  trailingButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 44,
  },
  trailingButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  statuses: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingTop: 3,
  },
  statusLabel: {
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  statusLabelText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  message: {
    fontSize: 13,
    lineHeight: 19,
    marginLeft: 56,
  },
  duplicateActions: {
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 4,
    marginLeft: 56,
    paddingTop: 6,
  },
  duplicateHint: {
    fontSize: 13,
    lineHeight: 19,
  },
  duplicateButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  actionButton: {
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 7,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  excludeButton: {
    alignSelf: 'flex-start',
    justifyContent: 'center',
    marginLeft: 56,
    minHeight: 44,
  },
  excludeText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
