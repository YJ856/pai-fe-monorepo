/**
 * 부모 퀴즈 관리 화면
 *
 * 주요 기능:
 * - 탭 전환 (오늘의 퀴즈/지난 퀴즈/예정된 퀴즈)
 * - 퀴즈 생성, 수정, 삭제
 * - 자녀별 풀이 현황 확인
 * - 보상 지급
 * - 플로팅 퀴즈 추가 버튼
 *
 * 디자인:
 * - 블루 그라데이션 배경 (from-blue-50 to-indigo-50)
 * - 둥근 탭 버튼, 활성 탭 블루 그라데이션
 * - 퀴즈 카드: 회색 배경, 풀이 현황 표시
 * - 플로팅 액션 버튼: 그라데이션 원형
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckCircle, XCircle, Gift, Calendar, User, Edit, Trash2, X } from 'lucide-react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { spacing, typography, borderRadius, shadows } from '../../../design/tokens';
import { useTodayQuizzes } from './_hooks/useTodayQuizzes';
import { usePastQuizzes } from './_hooks/usePastQuizzes';
import { useScheduledQuizzes } from './_hooks/useScheduledQuizzes';
import { useCreateQuiz } from './_hooks/useCreateQuiz';
import { useDeleteQuiz } from './_hooks/useDeleteQuiz';
import { useGrantQuizReward } from './_hooks/useGrantQuizReward';
import { updateQuiz } from '../../../api/quizzes';
import { QuizFormModal } from './QuizFormModal';

interface Quiz {
  id: string;
  question: string;
  answer: string;
  hint?: string;
  reward?: string;
  author: string;
  authorAvatar?: string;
  date: Date;
  childSolutions: ChildSolution[];
  isEditable?: boolean;
}

interface ChildSolution {
  childId: string;
  childName: string;
  childAvatar?: string;
  solved: boolean;
  rewardGiven?: boolean;
}

type TabKey = 'today' | 'history' | 'scheduled';

export default function ParentQuizScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('today');
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);

  // Custom Hook으로 퀴즈 데이터 가져오기
  const {
    todayQuizzes: todayQuizzesData,
    isLoading: isLoadingTodayQuizzes,
    isError: isErrorTodayQuizzes,
    error: errorTodayQuizzes,
  } = useTodayQuizzes();

  const {
    pastQuizzes: pastQuizzesData,
    isLoading: isLoadingPastQuizzes,
    isError: isErrorPastQuizzes,
    error: errorPastQuizzes,
  } = usePastQuizzes();

  console.log('[ParentQuiz] Today Quizzes:', {
    count: todayQuizzesData?.length,
    isLoading: isLoadingTodayQuizzes,
    isError: isErrorTodayQuizzes,
    error: errorTodayQuizzes?.message,
  });

  console.log('[ParentQuiz] Past Quizzes:', {
    count: pastQuizzesData?.length,
    isLoading: isLoadingPastQuizzes,
    isError: isErrorPastQuizzes,
    error: errorPastQuizzes?.message,
  });

  const {
    scheduledQuizzes: scheduledQuizzesData,
    isLoading: isLoadingScheduledQuizzes,
    isError: isErrorScheduledQuizzes,
    error: errorScheduledQuizzes,
  } = useScheduledQuizzes();

  console.log('[ParentQuiz] Scheduled Quizzes:', {
    data: scheduledQuizzesData,
    count: scheduledQuizzesData?.length,
    isLoading: isLoadingScheduledQuizzes,
    isError: isErrorScheduledQuizzes,
    error: errorScheduledQuizzes?.message,
  });

  const queryClient = useQueryClient();

  // Mutation hooks
  const { createQuiz, isCreating, nextPublishDate } = useCreateQuiz();
  const { deleteQuiz, isDeleting } = useDeleteQuiz();
  const { grantReward, isGranting } = useGrantQuizReward();

  // 퀴즈 수정 mutation
  const updateQuizMutation = useMutation({
    mutationFn: ({ quizId, data }: {
      quizId: string;
      data: {
        question: string;
        answer: string;
        hint: string | null;
        reward: string | null;
        publishDate: string;
      }
    }) => {
      return updateQuiz({ quizId }, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent-quizzes', 'today'] });
      queryClient.invalidateQueries({ queryKey: ['parent-quizzes', 'scheduled'] });
      queryClient.invalidateQueries({ queryKey: ['parent-quizzes', 'next-publish-date'] });
    },
  });

  // ViewModel → UI 형식으로 변환
  const todayQuizzes: Quiz[] = todayQuizzesData.map((quiz) => ({
    id: quiz.id,
    question: quiz.question,
    answer: quiz.answer,
    hint: quiz.hint,
    reward: quiz.reward,
    author: quiz.authorName,
    authorAvatar: quiz.authorAvatarUrl,
    date: quiz.publishDate,
    isEditable: quiz.isEditable,
    childSolutions: quiz.children.map((child) => ({
      childId: String(child.childProfileId),
      childName: child.childName,
      childAvatar: child.childAvatarUrl,
      solved: child.isSolved ?? false,
      rewardGiven: child.rewardGranted,
    })),
  }));

  const pastQuizzes: Quiz[] = pastQuizzesData.map((quiz) => ({
    id: quiz.id,
    question: quiz.question,
    answer: quiz.answer,
    hint: quiz.hint,
    reward: quiz.reward,
    author: quiz.authorName,
    authorAvatar: quiz.authorAvatarUrl,
    date: quiz.publishDate,
    isEditable: quiz.isEditable,
    childSolutions: quiz.children.map((child) => ({
      childId: String(child.childProfileId),
      childName: child.childName,
      childAvatar: child.childAvatarUrl,
      solved: child.isSolved ?? false,
      rewardGiven: child.rewardGranted,
    })),
  }));

  const scheduledQuizzes: Quiz[] = scheduledQuizzesData.map((quiz) => {
    console.log('[Quiz] Scheduled Quiz ID:', quiz.id, 'isEditable:', quiz.isEditable, 'author:', quiz.authorName);
    return {
      id: quiz.id,
      question: quiz.question,
      answer: quiz.answer,
      hint: quiz.hint,
      reward: quiz.reward,
      author: quiz.authorName,
      authorAvatar: quiz.authorAvatarUrl,
      date: quiz.publishDate,
      isEditable: quiz.isEditable,
      childSolutions: [],
    };
  });

  // 핸들러 함수들
  const handleCreateQuiz = (data: {
    question: string;
    answer: string;
    hint?: string;
    reward?: string;
    publishDate: Date;
  }) => {
    const payload = {
      question: data.question,
      answer: data.answer,
      hint: data.hint || null,
      reward: data.reward || null,
      publishDate: formatDateToYYYYMMDD(data.publishDate),
    };

    createQuiz(
      payload,
      {
        onSuccess: () => {
          setShowCreateModal(false);
          setEditingQuiz(null);
        },
        onError: (error: any) => {
          console.error('퀴즈 생성 실패:', error);
          alert('퀴즈 생성에 실패했습니다.');
        },
      }
    );
  };

  const handleUpdateQuiz = (data: {
    question: string;
    answer: string;
    hint?: string;
    reward?: string;
    publishDate: Date;
  }) => {
    if (!editingQuiz) return;

    updateQuizMutation.mutate(
      {
        quizId: editingQuiz.id,
        data: {
          question: data.question,
          answer: data.answer,
          hint: data.hint || null,
          reward: data.reward || null,
          publishDate: formatDateToYYYYMMDD(data.publishDate),
        },
      },
      {
        onSuccess: () => {
          setShowCreateModal(false);
          setEditingQuiz(null);
        },
        onError: (error: any) => {
          console.error('퀴즈 수정 실패:', error);
          alert('퀴즈 수정에 실패했습니다.');
        },
      }
    );
  };

  const handleDeleteQuiz = (quizId: string) => {
    deleteQuiz(
      { quizId },
      {
        onSuccess: () => {
          console.log('퀴즈 삭제 성공');
        },
        onError: (error) => {
          console.error('퀴즈 삭제 실패:', error);
          alert('퀴즈 삭제에 실패했습니다.');
        },
      }
    );
  };

  const handleEditQuiz = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setShowCreateModal(true);
  };

  const handleGrantReward = (quizId: string, childId: string) => {
    grantReward(
      {
        quizId,
        childProfileId: Number(childId),
        payload: { grant: true },
      },
      {
        onSuccess: () => {
          console.log('보상 지급 성공');
        },
        onError: (error) => {
          console.error('보상 지급 실패:', error);
          alert('보상 지급에 실패했습니다.');
        },
      }
    );
  };

  const groupQuizzesByDate = (quizzes: Quiz[]) => {
    const grouped: Record<string, Quiz[]> = {};
    quizzes.forEach((quiz) => {
      const dateKey = quiz.date.toLocaleDateString('ko-KR');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(quiz);
    });
    return grouped;
  };

  const pastQuizzesByDate = groupQuizzesByDate(pastQuizzes);
  const scheduledQuizzesByDate = groupQuizzesByDate(scheduledQuizzes);

  // 탭 전환 핸들러
  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    // 탭 전환 시 next-publish-date 캐시 무효화하여 항상 최신 출제일 가져오기
    queryClient.invalidateQueries({ queryKey: ['parent-quizzes', 'next-publish-date'] });
  };

  // Date를 'yyyy-MM-dd' 형식으로 변환
  const formatDateToYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const renderQuizCard = (quiz: Quiz) => {
    const solutions = quiz.childSolutions;
    const showActions = activeTab === 'scheduled';

    return (
      <TouchableOpacity
        key={quiz.id}
        style={styles.quizCard}
        onPress={() => {
          if (activeTab === 'history') {
            setSelectedQuiz(quiz);
            setShowDetailModal(true);
          }
        }}
        activeOpacity={0.7}
      >
        <View style={styles.quizQuestionContainer}>
          <LinearGradient
            colors={['#5B9BD5', '#667BC6']}
            style={styles.quizQuestionBadge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.quizQuestionIcon}>?</Text>
          </LinearGradient>
          <Text style={styles.quizQuestion}>{quiz.question}</Text>
        </View>

        <View style={styles.quizDetails}>
          <Text style={styles.quizDetail}>
            <Text style={styles.quizDetailLabel}>정답:</Text> {quiz.answer}
          </Text>
          {quiz.hint && (
            <Text style={styles.quizDetail}>
              <Text style={styles.quizDetailLabel}>힌트:</Text> {quiz.hint}
            </Text>
          )}
          {quiz.reward && (
            <Text style={styles.quizDetail}>
              <Text style={styles.quizDetailLabel}>보상:</Text> {quiz.reward}
            </Text>
          )}
        </View>

        {/* Author Badge */}
        <View style={styles.authorBadgeContainer}>
          <View style={styles.authorBadge}>
            {quiz.authorAvatar ? (
              <Image
                source={{ uri: quiz.authorAvatar }}
                style={styles.authorAvatar}
              />
            ) : (
              <View style={styles.authorAvatarPlaceholder}>
                <User size={16} color="#9CA3AF" />
              </View>
            )}
            <Text style={styles.authorName}>{quiz.author}</Text>
          </View>
        </View>

        {/* Today Tab: Show Solutions */}
        {activeTab === 'today' && (
          <View style={styles.solutionsContainer}>
            <Text style={styles.solutionsTitle}>풀이 현황</Text>
            <View style={styles.solutionsGrid}>
              {solutions.map((solution) => (
                <View
                  key={solution.childId}
                  style={styles.solutionCard}
                >
                  {/* 원형 아바타 */}
                  <View style={[
                    styles.solutionAvatarContainer,
                    solution.solved ? styles.solutionAvatarSolved : styles.solutionAvatarPending
                  ]}>
                    {solution.childAvatar ? (
                      <Image
                        source={{ uri: solution.childAvatar }}
                        style={styles.solutionAvatarImage}
                      />
                    ) : (
                      <User size={24} color={solution.solved ? "#10B981" : "#9CA3AF"} />
                    )}
                    {/* 상태 뱃지 */}
                    <View style={[
                      styles.solutionStatusBadge,
                      solution.solved ? styles.solutionStatusSolved : styles.solutionStatusPending
                    ]}>
                      {solution.solved ? (
                        <CheckCircle size={12} color="#FFFFFF" />
                      ) : (
                        <XCircle size={12} color="#FFFFFF" />
                      )}
                    </View>
                  </View>

                  {/* 이름 */}
                  <Text style={styles.solutionName}>{solution.childName}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Scheduled Tab: Show Actions (본인 작성자일 때만) */}
        {showActions && quiz.isEditable === true && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.7}
              onPress={() => handleEditQuiz(quiz)}
            >
              <Edit size={16} color="#5B9BD5" />
              <Text style={styles.actionButtonText}>수정</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              activeOpacity={0.7}
              onPress={() => {
                Alert.alert(
                  '퀴즈 삭제',
                  '정말 이 퀴즈를 삭제하시겠습니까?',
                  [
                    { text: '취소', style: 'cancel' },
                    {
                      text: '삭제',
                      style: 'destructive',
                      onPress: () => handleDeleteQuiz(quiz.id),
                    },
                  ]
                );
              }}
            >
              <Trash2 size={16} color="#EF4444" />
              <Text style={[styles.actionButtonText, styles.deleteButtonText]}>삭제</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <LinearGradient colors={['#EFF6FF', '#E0E7FF']} style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <View style={styles.tabsList}>
          <TouchableOpacity
            style={styles.tabTrigger}
            onPress={() => handleTabChange('today')}
            activeOpacity={0.8}
          >
            {activeTab === 'today' ? (
              <LinearGradient
                colors={['#5B9BD5', '#667BC6']}
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
            onPress={() => handleTabChange('history')}
            activeOpacity={0.8}
          >
            {activeTab === 'history' ? (
              <LinearGradient
                colors={['#5B9BD5', '#667BC6']}
                style={styles.tabTriggerActive}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.tabTextActive}>지난 퀴즈</Text>
              </LinearGradient>
            ) : (
              <Text style={styles.tabText}>지난 퀴즈</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabTrigger}
            onPress={() => handleTabChange('scheduled')}
            activeOpacity={0.8}
          >
            {activeTab === 'scheduled' ? (
              <LinearGradient
                colors={['#5B9BD5', '#667BC6']}
                style={styles.tabTriggerActive}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.tabTextActive}>예정된 퀴즈</Text>
              </LinearGradient>
            ) : (
              <Text style={styles.tabText}>예정된 퀴즈</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'today' && (
          isLoadingTodayQuizzes ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" />
            </View>
          ) : (
            todayQuizzes.map((quiz) => renderQuizCard(quiz))
          )
        )}

        {activeTab === 'history' &&
          Object.entries(pastQuizzesByDate).map(([date, quizzes]) => (
            <View key={date} style={styles.dateGroup}>
              <View style={styles.dateBadge}>
                <Calendar size={16} color="#667BC6" />
                <Text style={styles.dateText}>{date}</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.horizontalCards}>
                  {quizzes.map((quiz) => (
                    <View key={quiz.id} style={styles.horizontalCard}>
                      {renderQuizCard(quiz)}
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          ))}

        {activeTab === 'scheduled' &&
          Object.entries(scheduledQuizzesByDate).map(([date, quizzes]) => (
            <View key={date} style={styles.dateGroup}>
              <View style={styles.dateBadge}>
                <Calendar size={16} color="#667BC6" />
                <Text style={styles.dateText}>{date}</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.horizontalCards}>
                  {quizzes.map((quiz) => (
                    <View key={quiz.id} style={styles.horizontalCard}>
                      {renderQuizCard(quiz)}
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          ))}
      </ScrollView>

      {/* Detail Modal */}
      {selectedQuiz && (
        <Modal
          visible={showDetailModal}
          transparent
          animationType="fade"
          statusBarTranslucent
          onRequestClose={() => setShowDetailModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowDetailModal(false)}
          >
            <TouchableOpacity
              style={styles.modalContent}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>퀴즈 풀이 기록</Text>
                <TouchableOpacity
                  onPress={() => setShowDetailModal(false)}
                  style={styles.modalCloseButton}
                >
                  <X size={24} color="#5B9BD5" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalSolutions}>
                {selectedQuiz.childSolutions.map((solution) => (
                  <View
                    key={solution.childId}
                    style={styles.modalSolutionCard}
                  >
                    {/* 프로필 영역 */}
                    <View style={styles.modalSolutionProfile}>
                      {/* 아바타 */}
                      <View style={[
                        styles.modalAvatarContainer,
                        solution.solved ? styles.modalAvatarSolved : styles.modalAvatarPending
                      ]}>
                        {solution.childAvatar ? (
                          <Image
                            source={{ uri: solution.childAvatar }}
                            style={styles.modalAvatarImage}
                          />
                        ) : (
                          <User size={32} color={solution.solved ? "#10B981" : "#9CA3AF"} />
                        )}
                        {/* 상태 뱃지 */}
                        <View style={[
                          styles.modalStatusBadge,
                          solution.solved ? styles.modalStatusSolved : styles.modalStatusPending
                        ]}>
                          {solution.solved ? (
                            <CheckCircle size={16} color="#FFFFFF" />
                          ) : (
                            <XCircle size={16} color="#FFFFFF" />
                          )}
                        </View>
                      </View>

                      {/* 이름 */}
                      <Text style={styles.modalSolutionName}>{solution.childName}</Text>
                    </View>

                    {/* 보상 버튼 (풀이 완료 + 보상 있을 때만) */}
                    {solution.solved && selectedQuiz.reward && (
                      <TouchableOpacity
                        onPress={() => handleGrantReward(selectedQuiz.id, solution.childId)}
                        disabled={solution.rewardGiven || isGranting}
                        style={[
                          styles.modalRewardButton,
                          solution.rewardGiven && styles.modalRewardButtonDisabled
                        ]}
                        activeOpacity={0.7}
                      >
                        <Gift size={14} color={solution.rewardGiven ? '#9CA3AF' : '#10B981'} />
                        <Text style={[
                          styles.modalRewardButtonText,
                          solution.rewardGiven && styles.modalRewardButtonTextDisabled
                        ]}>
                          {isGranting ? '처리 중...' : solution.rewardGiven ? '보상 지급 완료' : '보상 지급'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Quiz Form Modal */}
      <QuizFormModal
        visible={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingQuiz(null);
        }}
        defaultPublishDate={nextPublishDate}
        editQuiz={editingQuiz ? {
          id: editingQuiz.id,
          question: editingQuiz.question,
          answer: editingQuiz.answer,
          hint: editingQuiz.hint,
          reward: editingQuiz.reward,
          date: editingQuiz.date,
        } : null}
        onSubmit={editingQuiz ? handleUpdateQuiz : handleCreateQuiz}
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setEditingQuiz(null);
          setShowCreateModal(true);
        }}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#5B9BD5', '#667BC6']}
          style={styles.fabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.fabText}>+</Text>
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EFF6FF',
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
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  quizCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.xs,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  quizQuestionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  quizQuestionBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quizQuestionIcon: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  quizQuestion: {
    ...typography.h4,
    color: '#111827',
    flex: 1,
    lineHeight: 24,
  },
  quizDetails: {
    marginBottom: spacing.sm,
  },
  quizDetail: {
    ...typography.body2,
    color: '#6B7280',
    marginBottom: 4,
  },
  quizDetailLabel: {
    fontWeight: 'bold',
  },
  authorBadgeContainer: {
    alignItems: 'flex-end',
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
  },
  authorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    paddingVertical: 4,
    paddingHorizontal: 10,
    gap: 6,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  authorEmoji: {
    fontSize: 18,
  },
  authorName: {
    ...typography.caption,
    color: '#374151',
  },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  authorAvatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  solutionsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: spacing.md,
  },
  solutionsTitle: {
    ...typography.body2,
    color: '#374151',
    marginBottom: spacing.sm,
  },
  solutionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: spacing.sm,
  },
  solutionCard: {
    alignItems: 'center',
    width: '23%',
    maxWidth: 80,
  },
  solutionAvatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: spacing.xs,
    position: 'relative',
  },
  solutionAvatarSolved: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  solutionAvatarPending: {
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
  },
  solutionAvatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  solutionStatusBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  solutionStatusSolved: {
    backgroundColor: '#10B981',
  },
  solutionStatusPending: {
    backgroundColor: '#9CA3AF',
  },
  solutionName: {
    ...typography.caption,
    color: '#111827',
    fontWeight: '500',
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#5B9BD5',
    backgroundColor: '#FFFFFF',
    gap: spacing.xs,
  },
  actionButtonText: {
    ...typography.body2,
    color: '#5B9BD5',
  },
  deleteButton: {
    borderColor: '#EF4444',
  },
  deleteButtonText: {
    color: '#EF4444',
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
    marginBottom: spacing.sm,
  },
  dateText: {
    ...typography.body2,
    color: '#374151',
  },
  horizontalCards: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  horizontalCard: {
    width: 320,
  },
  floatingButton: {
    position: 'absolute',
    bottom: spacing.xl * 2,
    right: spacing.lg,
    width: 64,
    height: 64,
    borderRadius: 32,
    ...shadows.xl,
  },
  floatingButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: spacing.xl,
    margin: spacing.lg,
    ...shadows.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    ...typography.h3,
    fontSize: 20,
    color: '#1F2937',
    fontWeight: '700',
    flex: 1,
  },
  modalCloseButton: {
    padding: 0,
    marginLeft: spacing.sm,
  },
  modalQuestion: {
    ...typography.body1,
    color: '#111827',
    marginBottom: spacing.lg,
  },
  modalSolutions: {
    marginBottom: spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  modalSolutionCard: {
    alignItems: 'center',
    width: '42%',
    maxWidth: 140,
    marginBottom: spacing.md,
  },
  modalSolutionProfile: {
    alignItems: 'center',
    width: '100%',
  },
  modalAvatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    position: 'relative',
    marginBottom: spacing.sm,
  },
  modalAvatarSolved: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  modalAvatarPending: {
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  modalAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  modalStatusBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  modalStatusSolved: {
    backgroundColor: '#10B981',
  },
  modalStatusPending: {
    backgroundColor: '#9CA3AF',
  },
  modalSolutionName: {
    ...typography.body1,
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginTop: spacing.xs,
  },
  modalStatusText: {
    ...typography.caption,
    fontSize: 11,
    marginBottom: spacing.xs,
  },
  modalStatusTextSolved: {
    color: '#10B981',
    fontWeight: '600',
  },
  modalStatusTextPending: {
    color: '#9CA3AF',
  },
  modalRewardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#ECFDF5',
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginTop: spacing.xs,
  },
  modalRewardButtonDisabled: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  modalRewardButtonText: {
    ...typography.caption,
    fontSize: 10,
    color: '#10B981',
    fontWeight: '600',
  },
  modalRewardButtonTextDisabled: {
    color: '#9CA3AF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    ...shadows.lg,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
    lineHeight: 36,
  },
});
