/**
 * 자녀 퀴즈 화면
 *
 * 주요 기능:
 * - 탭 전환 (오늘의 퀴즈/풀었던 퀴즈)
 * - 퀴즈 카드 (문제, 힌트, 정답 입력)
 * - 정답/오답 모달
 * - 풀었던 퀴즈 날짜별 그룹화
 *
 * 디자인:
 * - 핑크-오렌지 그라데이션 배경 (#FFE5E0 ~ #FFF0ED)
 * - 탭: 둥근 버튼 스타일, 활성 탭에 그라데이션
 * - 퀴즈 카드: 흰색 카드, 둥근 모서리, 그림자
 * - 정답 제출 버튼: 그라데이션 버튼
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Lightbulb, Trophy, Lock, CheckCircle, Calendar, User } from 'lucide-react-native';
import { spacing, typography, borderRadius, shadows } from '../../../design/tokens';
import { useTodayQuizzes } from './_hooks/useTodayQuizzes';
import { usePastQuizzes } from './_hooks/usePastQuizzes';
import type { ChildQuizViewModel } from './_types/childQuizViewModel';

type TabKey = 'today' | 'history';

export default function ChildQuizScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('today');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showHints, setShowHints] = useState<Record<string, boolean>>({});
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultType, setResultType] = useState<'success' | 'failure'>('success');
  const [resultReward, setResultReward] = useState('');

  // Custom Hook으로 오늘의 퀴즈 데이터 가져오기
  const {
    todayQuizzes,
    isLoading: isLoadingTodayQuizzes,
    submitAnswer,
    submitResult,
  } = useTodayQuizzes();

  // Custom Hook으로 완료한 퀴즈 데이터 가져오기
  const {
    pastQuizzesByDate,
    isLoading: isLoadingPastQuizzes,
  } = usePastQuizzes();

  const handleAnswerChange = (quizId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [quizId]: value }));
  };

  const toggleHint = (quizId: string) => {
    setShowHints((prev) => ({ ...prev, [quizId]: !prev[quizId] }));
  };

  const handleSubmit = (quiz: ChildQuizViewModel) => {
    const userAnswer = answers[quiz.id]?.trim();

    if (!userAnswer) {
      return; // 답변이 비어있으면 제출하지 않음
    }

    // 백엔드로 정답 제출
    submitAnswer(
      { quizId: quiz.id, answer: userAnswer },
      {
        onSuccess: (result) => {
          if (result.isSolved) {
            // 정답!
            setResultType('success');
            setResultReward(result.reward || quiz.reward);
            setShowResultModal(true);
          } else {
            // 오답!
            setResultType('failure');
            setShowResultModal(true);
          }
        },
      }
    );
  };

  const renderQuizCard = (quiz: ChildQuizViewModel, isPastTab: boolean = false) => (
    <View
      key={quiz.id}
      style={[styles.quizCard, quiz.solved && !isPastTab && styles.quizCardSolved]}
    >
      {/* Author and Reward */}
      <View style={styles.cardHeader}>
        <View style={styles.authorContainer}>
          {quiz.authorAvatarUrl ? (
            <Image
              source={{ uri: quiz.authorAvatarUrl }}
              style={styles.authorAvatarImage}
            />
          ) : (
            <LinearGradient
              colors={['#FF6B9D', '#FFA06B']}
              style={styles.authorAvatar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <User size={20} color="#FFFFFF" />
            </LinearGradient>
          )}
          <Text style={styles.authorName}>{quiz.authorName}</Text>
        </View>
        <View style={styles.rewardContainer}>
          <Trophy size={16} color="#FFA06B" />
          <Text style={styles.rewardText}>{quiz.reward}</Text>
        </View>
      </View>

      {/* Question */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{quiz.question}</Text>
        {quiz.solved && !isPastTab && <Lock size={20} color="#9CA3AF" />}
      </View>

      {/* Answer Area */}
      {quiz.solved || isPastTab ? (
        <View style={styles.solvedContainer}>
          <View style={styles.solvedHeader}>
            <CheckCircle size={24} color="#FF6B9D" />
            <Text style={styles.solvedLabel}>정답!</Text>
          </View>
          <Text style={styles.solvedAnswer}>{quiz.childAnswer || quiz.answer}</Text>
        </View>
      ) : (
        <>
          {/* Hint */}
          {quiz.hint && (
            <View style={styles.hintContainer}>
              <TouchableOpacity
                style={styles.hintButton}
                onPress={() => toggleHint(quiz.id)}
                activeOpacity={0.7}
              >
                <Lightbulb size={16} color="#FF6B9D" />
                <Text style={styles.hintButtonText}>
                  {showHints[quiz.id] ? '힌트 숨기기' : '힌트 보기'}
                </Text>
              </TouchableOpacity>
              {showHints[quiz.id] && (
                <View style={styles.hintBox}>
                  <Text style={styles.hintText}>{quiz.hint}</Text>
                </View>
              )}
            </View>
          )}

          {/* Answer Input */}
          <View style={styles.answerInputContainer}>
            <TextInput
              style={styles.answerInput}
              placeholder="정답을 입력하세요"
              placeholderTextColor="#9CA3AF"
              value={answers[quiz.id] || ''}
              onChangeText={(value) => handleAnswerChange(quiz.id, value)}
            />
            <TouchableOpacity
              onPress={() => handleSubmit(quiz)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FF6B9D', '#FFA06B']}
                style={styles.submitButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.submitButtonText}>정답 제출하기! 🚀</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#FFE5E0', '#FFF0ED']} style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <View style={styles.tabsList}>
          <TouchableOpacity
            style={styles.tabTrigger}
            onPress={() => setActiveTab('today')}
            activeOpacity={0.8}
          >
            {activeTab === 'today' ? (
              <LinearGradient
                colors={['#FF6B9D', '#FFA06B']}
                style={styles.tabTriggerActive}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.tabTextActive}>오늘의 퀴즈</Text>
              </LinearGradient>
            ) : (
              <Text style={styles.tabText}>오늘의 퀴즈</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabTrigger}
            onPress={() => setActiveTab('history')}
            activeOpacity={0.8}
          >
            {activeTab === 'history' ? (
              <LinearGradient
                colors={['#FF6B9D', '#FFA06B']}
                style={styles.tabTriggerActive}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.tabTextActive}>풀었던 퀴즈</Text>
              </LinearGradient>
            ) : (
              <Text style={styles.tabText}>풀었던 퀴즈</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'today' ? (
          // Today's Quizzes
          todayQuizzes.map((quiz) => renderQuizCard(quiz, false))
        ) : (
          // Past Quizzes
          Object.entries(pastQuizzesByDate).map(([date, quizzes]) => (
            <View key={date} style={styles.dateGroup}>
              <View style={styles.dateBadge}>
                <Calendar size={16} color="#FF6B9D" />
                <Text style={styles.dateText}>{date}</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {quizzes.map((quiz) => (
                  <View key={quiz.id} style={styles.pastQuizCard}>
                    {renderQuizCard(quiz, true)}
                  </View>
                ))}
              </ScrollView>
            </View>
          ))
        )}
      </ScrollView>

      {/* Result Modal */}
      <Modal
        visible={showResultModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowResultModal(false)}
      >
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={['#FFE5E0', '#FFF0ED']}
            style={styles.modalContent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalEmoji}>
                {resultType === 'success' ? '🎉' : '😔'}
              </Text>
              <Text
                style={[
                  styles.modalTitle,
                  resultType === 'success' ? styles.modalTitleSuccess : styles.modalTitleFailure,
                ]}
              >
                {resultType === 'success' ? '정답!' : '아쉽지만 오답!'}
              </Text>
            </View>

            {/* Body */}
            <View style={styles.modalBody}>
              {resultType === 'success' ? (
                <>
                  <Text style={styles.modalText}>축하해요!</Text>
                  <View style={styles.rewardCard}>
                    <Trophy size={48} color="#FFA06B" />
                    <Text style={styles.rewardCardText}>{resultReward}</Text>
                    <Text style={styles.rewardCardSubtext}>획득!</Text>
                  </View>
                </>
              ) : (
                <Text style={styles.modalText}>다시 한번 생각해보고 도전해봐요! 💪</Text>
              )}
            </View>

            {/* Button */}
            <TouchableOpacity
              onPress={() => setShowResultModal(false)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FF6B9D', '#FFA06B']}
                style={styles.modalButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.modalButtonText}>확인</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Modal>
    </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFE5E0',
  },
  container: {
    flex: 1,
  },
  tabsContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  tabsList: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 100,
    padding: 8,
    marginBottom: spacing.md,
    ...shadows.lg,
  },
  tabTrigger: {
    flex: 1,
  },
  tabTriggerActive: {
    borderRadius: 100,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  tabText: {
    ...typography.button,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 12,
  },
  tabTextActive: {
    ...typography.button,
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  quizCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.xl,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  quizCardSolved: {
    opacity: 0.75,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.sm,
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  authorEmoji: {
    fontSize: 18,
  },
  authorName: {
    ...typography.body2,
    color: '#374151',
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rewardText: {
    ...typography.body2,
    color: '#6B7280',
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  questionText: {
    ...typography.h4,
    color: '#1F2937',
    flex: 1,
    lineHeight: 28,
  },
  solvedContainer: {
    backgroundColor: 'rgba(255, 160, 107, 0.2)',
    borderRadius: 16,
    padding: spacing.md,
  },
  solvedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  checkmark: {
    fontSize: 24,
  },
  solvedLabel: {
    ...typography.body1,
    color: '#1F2937',
  },
  solvedAnswer: {
    ...typography.h4,
    color: '#1F2937',
  },
  hintContainer: {
    marginBottom: spacing.md,
  },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#FF6B9D',
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
  },
  hintButtonText: {
    ...typography.body2,
    color: '#FF6B9D',
  },
  hintBox: {
    marginTop: spacing.sm,
    padding: spacing.md,
    backgroundColor: '#FCE7F3',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FF6B9D',
  },
  hintText: {
    ...typography.body2,
    color: '#374151',
  },
  answerInputContainer: {
    gap: spacing.sm,
  },
  answerInput: {
    ...typography.body1,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: '#FFFFFF',
  },
  submitButton: {
    borderRadius: 100,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  submitButtonText: {
    ...typography.button,
    color: '#FFFFFF',
  },
  dateGroup: {
    marginBottom: spacing.xl,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 100,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  dateText: {
    ...typography.body2,
    color: '#374151',
  },
  horizontalScroll: {
    gap: spacing.md,
  },
  pastQuizCard: {
    width: 320,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 4,
    borderColor: '#FF6B9D',
    ...shadows.lg,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  modalTitle: {
    ...typography.h2,
  },
  modalTitleSuccess: {
    color: '#FF6B9D',
  },
  modalTitleFailure: {
    color: '#6B7280',
  },
  modalBody: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  modalText: {
    ...typography.h4,
    color: '#1F2937',
    marginBottom: spacing.md,
  },
  rewardCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.lg,
  },
  rewardCardText: {
    ...typography.h3,
    color: '#1F2937',
    marginTop: spacing.sm,
  },
  rewardCardSubtext: {
    ...typography.body2,
    color: '#6B7280',
    marginTop: spacing.xs,
  },
  modalButton: {
    borderRadius: 100,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    ...typography.button,
    color: '#FFFFFF',
  },
});
