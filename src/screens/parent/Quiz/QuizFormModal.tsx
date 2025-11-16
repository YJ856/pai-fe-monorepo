/**
 * 퀴즈 생성/수정 모달 (UI)
 *
 * 디자인 참고: Parent-Child AI App Design_v2/src/components/parent/QuizCreationModal.tsx
 *
 * 기능:
 * - 새 퀴즈 생성
 * - 기존 퀴즈 수정 (editQuiz prop 전달 시)
 * - 필수 입력: 질문, 정답, 출제일
 * - 선택 입력: 힌트, 보상
 */

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button } from '../../../design/components/Button';
import { colors, spacing, borderRadius } from '../../../design/tokens';
import { useQuizForm } from './_hooks/useQuizForm';

interface QuizFormModalProps {
  visible: boolean;
  onClose: () => void;
  editQuiz?: {
    id: string;
    question: string;
    answer: string;
    hint?: string;
    reward?: string;
    date: string;
  };
}

export function QuizFormModal({
  visible,
  onClose,
  editQuiz,
}: QuizFormModalProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const {
    question,
    setQuestion,
    answer,
    setAnswer,
    hint,
    setHint,
    reward,
    setReward,
    publishDate,
    setPublishDate,
    handleSubmit,
    handleClose,
    isLoading,
    isEditMode,
  } = useQuizForm({ editQuiz, onClose });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <Text style={styles.title}>
              {isEditMode ? '퀴즈 수정하기' : '새로운 퀴즈 만들기'}
            </Text>

            {/* Question */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                퀴즈 질문 <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.textarea}
                placeholder="아이에게 물어볼 질문을 입력하세요"
                placeholderTextColor="#9CA3AF"
                value={question}
                onChangeText={setQuestion}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Answer */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                정답 <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="정답을 입력하세요"
                placeholderTextColor="#9CA3AF"
                value={answer}
                onChangeText={setAnswer}
              />
            </View>

            {/* Hint */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>힌트 (선택사항)</Text>
              <TextInput
                style={styles.input}
                placeholder="힌트를 입력하세요"
                placeholderTextColor="#9CA3AF"
                value={hint}
                onChangeText={setHint}
              />
            </View>

            {/* Reward */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>보상 (선택사항)</Text>
              <TextInput
                style={styles.input}
                placeholder="예: 스티커 3개 🌟"
                placeholderTextColor="#9CA3AF"
                value={reward}
                onChangeText={setReward}
              />
            </View>

            {/* Publish Date */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                출제일 <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={[styles.dateText, !publishDate && styles.placeholder]}>
                  {publishDate || 'YYYY-MM-DD'}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={publishDate ? new Date(publishDate) : new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(Platform.OS === 'ios');
                    if (selectedDate) {
                      const formattedDate = selectedDate.toISOString().split('T')[0];
                      setPublishDate(formattedDate);
                    }
                  }}
                  minimumDate={new Date()}
                />
              )}
            </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              variant="outline"
              onPress={handleClose}
              disabled={isLoading}
              style={styles.button}
            >
              취소
            </Button>
            <Button
              onPress={handleSubmit}
              loading={isLoading}
              style={styles.submitButton}
            >
              {isEditMode ? '수정하기' : '만들기'}
            </Button>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  safeArea: {
    flex: 0,
  },
  modalContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#5B9BD5',
    marginBottom: spacing.md,
  },
  fieldContainer: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: spacing.xs,
  },
  required: {
    color: colors.destructive,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    fontSize: 15,
    color: colors.foreground,
    backgroundColor: colors.background,
    height: 40,
  },
  textarea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    fontSize: 15,
    color: colors.foreground,
    backgroundColor: colors.background,
    minHeight: 70,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
    height: 40,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 15,
    color: colors.foreground,
  },
  placeholder: {
    color: '#9CA3AF',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  button: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#5B9BD5',
  },
});
