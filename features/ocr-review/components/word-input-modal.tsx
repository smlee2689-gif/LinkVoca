import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { OcrReviewColors } from '@/features/ocr-review/theme';
import { validateWordInput } from '@/features/ocr-review/validation';

type WordInputModalProps = Readonly<{
  visible: boolean;
  mode: 'edit' | 'add';
  initialValue: string;
  rawText: string | null;
  colors: OcrReviewColors;
  getDuplicateMessage: (value: string) => string | null;
  onCancel: () => void;
  onSubmit: (normalizedText: string) => void;
}>;

function getValidationMessage(errorCode: 'required' | 'invalid_characters'): string {
  return errorCode === 'required'
    ? '단어를 입력해 주세요.'
    : '영문자와 단일 공백, 하이픈, apostrophe만 사용할 수 있어요.';
}

export function WordInputModal({
  visible,
  mode,
  initialValue,
  rawText,
  colors,
  getDuplicateMessage,
  onCancel,
  onSubmit,
}: WordInputModalProps) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<TextInput>(null);
  const validation = validateWordInput(value);
  const duplicateMessage = getDuplicateMessage(value);

  useEffect(() => {
    if (visible) setValue(initialValue);
  }, [initialValue, visible]);

  return (
    <Modal
      animationType="fade"
      onRequestClose={onCancel}
      onShow={() => inputRef.current?.focus()}
      presentationStyle="overFullScreen"
      transparent
      visible={visible}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <Pressable
          accessibilityLabel="입력 창 닫기"
          accessibilityRole="button"
          onPress={onCancel}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView edges={['bottom']} style={styles.sheetWrapper}>
          <View
            accessibilityViewIsModal
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              <Text style={[styles.title, { color: colors.text }]}>
                {mode === 'edit' ? '단어 편집' : '직접 단어 추가'}
              </Text>
            </View>
            <ScrollView
              bounces={false}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              style={styles.scrollView}>
              {rawText !== null ? (
                <View style={[styles.rawPanel, { backgroundColor: colors.subtle }]}>
                  <Text style={[styles.label, { color: colors.secondaryText }]}>OCR 원문</Text>
                  <Text selectable style={[styles.rawValue, { color: colors.text }]}>
                    {rawText}
                  </Text>
                </View>
              ) : null}

              <Text style={[styles.label, { color: colors.secondaryText }]}>현재 단어</Text>
              <TextInput
                ref={inputRef}
                accessibilityLabel={mode === 'edit' ? '편집할 단어' : '추가할 단어'}
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={setValue}
                onSubmitEditing={() => {
                  if (validation.isValid) onSubmit(validation.normalizedText);
                }}
                returnKeyType="done"
                selectionColor={colors.primary}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.canvas,
                    borderColor: validation.isValid ? colors.border : colors.danger,
                    color: colors.text,
                  },
                ]}
                value={value}
              />

              {!validation.isValid ? (
                <Text accessibilityRole="alert" style={[styles.message, { color: colors.danger }]}>
                  {getValidationMessage(validation.errorCode)}
                </Text>
              ) : null}
              {duplicateMessage !== null ? (
                <Text accessibilityRole="alert" style={[styles.message, { color: colors.warning }]}>
                  {duplicateMessage}
                </Text>
              ) : null}
            </ScrollView>

            <View style={[styles.actions, { borderTopColor: colors.border }]}>
              <Pressable
                accessibilityRole="button"
                onPress={onCancel}
                style={({ pressed }) => [
                  styles.modalButton,
                  { borderColor: colors.border, opacity: pressed ? 0.65 : 1 },
                ]}>
                <Text style={[styles.cancelLabel, { color: colors.text }]}>취소</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: !validation.isValid }}
                disabled={!validation.isValid}
                onPress={() => {
                  if (validation.isValid) onSubmit(validation.normalizedText);
                }}
                style={({ pressed }) => [
                  styles.modalButton,
                  {
                    backgroundColor: validation.isValid ? colors.primary : colors.subtle,
                    borderColor: validation.isValid ? colors.primary : colors.border,
                    opacity: pressed ? 0.75 : 1,
                  },
                ]}>
                <Text
                  style={[
                    styles.submitLabel,
                    { color: validation.isValid ? colors.onPrimary : colors.disabledText },
                  ]}>
                  {mode === 'edit' ? '저장' : '추가'}
                </Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetWrapper: {
    maxHeight: '92%',
    width: '100%',
  },
  card: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    flexShrink: 1,
    maxHeight: '100%',
    overflow: 'hidden',
  },
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 14,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  scrollView: {
    flexShrink: 1,
    minHeight: 0,
  },
  scrollContent: {
    gap: 12,
    paddingBottom: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
  },
  rawPanel: {
    borderRadius: 12,
    gap: 2,
    padding: 12,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
  },
  rawValue: {
    fontSize: 16,
    lineHeight: 24,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 18,
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  modalButton: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: 16,
  },
  cancelLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
});
