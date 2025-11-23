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
import { CheckCircle, XCircle, Gift, Calendar, User, Edit, Trash2 } from 'lucide-react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { spacing, typography, borderRadius, shadows } from '../../../design/tokens';
import { Button } from '../../../design/components/Button';
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
  } = useTodayQuizzes();

  const {
    pastQuizzes: pastQuizzesData,
    isLoading: isLoadingPastQuizzes,
  } = usePastQuizzes();

  const {
    scheduledQuizzes: scheduledQuizzesData,
    isLoading: isLoadingScheduledQuizzes,
  } = useScheduledQuizzes();

  console.log(scheduledQuizzesData);
  

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
      // 퀴즈 수정 시 출제일이 변경될 수 있으므로 캐시 무효화
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
        <Text style={styles.quizQuestion}>{quiz.question}</Text>

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
                  style={[
                    styles.solutionCard,
                    solution.solved ? styles.solutionCardSolved : styles.solutionCardPending,
                  ]}
                >
                  <View style={styles.solutionInfo}>
                    {solution.childAvatar ? (
                      <Image
                        source={{ uri: solution.childAvatar }}
                        style={styles.childAvatar}
                      />
                    ) : (
                      <View style={styles.childAvatarPlaceholder}>
                        <User size={14} color="#9CA3AF" />
                      </View>
                    )}
                    <Text style={styles.solutionName}>{solution.childName}</Text>
                  </View>
                  {solution.solved ? (
                    <CheckCircle size={20} color="#10B981" />
                  ) : (
                    <XCircle size={20} color="#9CA3AF" />
                  )}
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
          onRequestClose={() => setShowDetailModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>퀴즈 풀이 기록</Text>
              <Text style={styles.modalQuestion}>{selectedQuiz.question}</Text>

              <View style={styles.modalSolutions}>
                {selectedQuiz.childSolutions.map((solution) => (
                  <View
                    key={solution.childId}
                    style={[
                      styles.modalSolutionCard,
                      solution.solved
                        ? styles.modalSolutionCardSolved
                        : styles.modalSolutionCardPending,
                    ]}
                  >
                    <View style={styles.modalSolutionHeader}>
                      <View style={styles.modalSolutionInfo}>
                        <Text style={styles.modalSolutionName}>{solution.childName}</Text>
                      </View>
                      {solution.solved ? (
                        <CheckCircle size={20} color="#10B981" />
                      ) : (
                        <XCircle size={20} color="#9CA3AF" />
                      )}
                    </View>
                    {solution.solved && selectedQuiz.reward && (
                      <Button
                        variant={solution.rewardGiven ? 'outline' : 'default'}
                        onPress={() => handleGrantReward(selectedQuiz.id, solution.childId)}
                        disabled={solution.rewardGiven || isGranting}
                        style={{
                          ...styles.rewardButton,
                          ...(!solution.rewardGiven && { backgroundColor: '#10B981' })
                        }}
                      >
                        <View style={styles.rewardButtonContent}>
                          <Gift size={16} color={solution.rewardGiven ? '#6B7280' : '#FFFFFF'} />
                          <Text style={[styles.rewardButtonText, { color: solution.rewardGiven ? '#6B7280' : '#FFFFFF' }]}>
                            {isGranting ? '처리 중...' : solution.rewardGiven ? '보상 지급 완료' : '보상 지급'}
                          </Text>
                        </View>
                      </Button>
                    )}
                  </View>
                ))}
              </View>

              <Button variant="outline" onPress={() => setShowDetailModal(false)}>
                닫기
              </Button>
            </View>
          </View>
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
    paddingBottom: spacing.xl * 2,
  },
  quizCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  quizQuestion: {
    ...typography.h4,
    color: '#111827',
    marginBottom: spacing.sm,
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
    gap: spacing.sm,
  },
  solutionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  solutionCardSolved: {
    backgroundColor: '#ECFDF5',
    borderColor: '#BBF7D0',
  },
  solutionCardPending: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  solutionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  solutionAvatar: {
    fontSize: 24,
  },
  solutionName: {
    ...typography.body2,
    color: '#111827',
  },
  childAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
  },
  childAvatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: spacing.md,
  },
  dateText: {
    ...typography.body2,
    color: '#374151',
  },
  horizontalCards: {
    flexDirection: 'row',
    gap: spacing.md,
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    ...shadows.lg,
  },
  modalTitle: {
    ...typography.h3,
    color: '#5B9BD5',
    marginBottom: spacing.md,
  },
  modalQuestion: {
    ...typography.body1,
    color: '#111827',
    marginBottom: spacing.lg,
  },
  modalSolutions: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  modalSolutionCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  modalSolutionCardSolved: {
    backgroundColor: '#ECFDF5',
    borderColor: '#BBF7D0',
  },
  modalSolutionCardPending: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  modalSolutionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  modalSolutionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  modalSolutionAvatar: {
    fontSize: 24,
  },
  modalSolutionName: {
    ...typography.body1,
    color: '#111827',
  },
  rewardButton: {
    marginTop: spacing.sm,
  },
  rewardButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  rewardButtonText: {
    ...typography.body2,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl * 2,
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
