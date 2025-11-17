/**
 * 퀴즈 생성/수정 모달
 *
 * 기능:
 * - 퀴즈 생성 (질문, 정답, 힌트, 보상, 출제일)
 * - 퀴즈 수정 (기존 데이터 불러오기)
 * - useCreateQuiz, useUpdateQuiz hook 연동
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X } from 'lucide-react-native';
import { spacing, typography, borderRadius } from '../../../design/tokens';
import DateTimePicker from '@react-native-community/datetimepicker';

interface QuizFormModalProps {
  visible: boolean;
  onClose: () => void;
  defaultPublishDate?: string | null; // 'yyyy-MM-dd' format
  editQuiz?: {
    id: string;
    question: string;
    answer: string;
    hint?: string;
    reward?: string;
    date: Date;
  } | null;
  onSubmit: (data: {
    question: string;
    answer: string;
    hint?: string;
    reward?: string;
    publishDate: Date;
  }) => void;
}

export function QuizFormModal({
  visible,
  onClose,
  defaultPublishDate,
  editQuiz,
  onSubmit,
}: QuizFormModalProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [hint, setHint] = useState('');
  const [reward, setReward] = useState('');
  const [publishDate, setPublishDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // editQuiz가 변경될 때마다 폼 초기화
  useEffect(() => {
    if (editQuiz) {
      setQuestion(editQuiz.question);
      setAnswer(editQuiz.answer);
      setHint(editQuiz.hint || '');
      setReward(editQuiz.reward || '');
      setPublishDate(editQuiz.date);
    } else {
      // 새로 생성할 때는 빈 값으로 초기화
      setQuestion('');
      setAnswer('');
      setHint('');
      setReward('');

      // defaultPublishDate가 있으면 사용, 없으면 현재 날짜
      if (defaultPublishDate) {
        // 'yyyy-MM-dd' 문자열을 Date 객체로 변환 (정오로 설정하여 타임존 문제 방지)
        const [year, month, day] = defaultPublishDate.split('-').map(Number);
        const newDate = new Date(year, month - 1, day, 12, 0, 0, 0);
        setPublishDate(newDate);
      } else {
        setPublishDate(new Date());
      }
    }
  }, [editQuiz, visible, defaultPublishDate]);

  const handleSubmit = () => {
    if (!question.trim() || !answer.trim()) {
      alert('질문과 정답은 필수입니다.');
      return;
    }

    onSubmit({
      question: question.trim(),
      answer: answer.trim(),
      hint: hint.trim() || undefined,
      reward: reward.trim() || undefined,
      publishDate,
    });

    // 폼 초기화
    setQuestion('');
    setAnswer('');
    setHint('');
    setReward('');
    setPublishDate(new Date());
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setPublishDate(selectedDate);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editQuiz ? '퀴즈 수정하기' : '새로운 퀴즈 만들기'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* 질문 */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                퀴즈 질문 <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.textarea, styles.input]}
                placeholder="아이에게 물어볼 질문을 입력하세요"
                value={question}
                onChangeText={setQuestion}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* 정답 */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                정답 <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="정답을 입력하세요"
                value={answer}
                onChangeText={setAnswer}
              />
            </View>

            {/* 힌트 */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>힌트 (선택사항)</Text>
              <TextInput
                style={styles.input}
                placeholder="힌트를 입력하세요"
                value={hint}
                onChangeText={setHint}
              />
            </View>

            {/* 보상 */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>보상 (선택사항)</Text>
              <TextInput
                style={styles.input}
                placeholder="예: 스티커 3개"
                value={reward}
                onChangeText={setReward}
              />
            </View>

            {/* 출제일 */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                출제일 <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {publishDate.toLocaleDateString('ko-KR')}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={publishDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDateChange}
                  minimumDate={new Date()}
                />
              )}
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.submitButtonContainer}
              onPress={handleSubmit}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#5B9BD5', '#667BC6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitButton}
              >
                <Text style={styles.submitButtonText}>
                  {editQuiz ? '수정하기' : '만들기'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    ...typography.h3,
    color: '#5B9BD5',
  },
  closeButton: {
    padding: spacing.xs,
  },
  scrollView: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.body1,
    color: '#111827',
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  required: {
    color: '#EF4444',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body1,
    color: '#111827',
  },
  textarea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  dateText: {
    ...typography.body1,
    color: '#111827',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    ...typography.button,
    color: '#6B7280',
  },
  submitButtonContainer: {
    flex: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  submitButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    ...typography.button,
    color: '#FFFFFF',
  },
});
