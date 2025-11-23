/**
 * 음성 등록 화면
 *
 * 주요 기능:
 * - 샘플 텍스트 읽기
 * - 음성 녹음/중지
 * - 녹음된 음성 재생
 * - 음성 저장
 *
 * 디자인:
 * - 화이트 배경
 * - 블루 그라데이션 녹음 버튼 (#5B9BD5)
 * - 녹음 중 빨간색 펄스 애니메이션
 * - 안내사항 카드
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Mic, Play, StopCircle } from 'lucide-react-native';
import { Audio } from 'expo-av';
import { spacing, typography, borderRadius, shadows } from '../../../design/tokens';
import { createProfileVoice } from '../../../api/profiles';
import { useProfileStore } from '../../../store/useProfileStore';

interface VoiceRegistrationScreenProps {
  onBack: () => void;
  hasExistingVoice?: boolean;
}

const SAMPLE_TEXT =
  '안녕! 오늘은 무엇이 궁금해? 나는 너의 질문에 답해주는 AI 친구야. 함께 재미있게 배워보자!';

export default function VoiceRegistrationScreen({ onBack, hasExistingVoice = false }: VoiceRegistrationScreenProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const currentProfile = useProfileStore((state) => state.currentProfile);
  const setCurrentProfile = useProfileStore((state) => state.setCurrentProfile);

  useEffect(() => {
    if (isRecording) {
      // Start pulse animation when recording
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Reset animation when not recording
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      try {
        if (recordingRef.current) {
          await recordingRef.current.stopAndUnloadAsync();
          const uri = recordingRef.current.getURI();
          setRecordingUri(uri);
          recordingRef.current = null;
          setIsRecording(false);
          setHasRecorded(true);
          console.log('녹음 완료:', uri);
        }
      } catch (error) {
        console.error('녹음 중지 오류:', error);
        Alert.alert('오류', '녹음을 중지하는데 실패했습니다.');
      }
    } else {
      // Start recording
      try {
        console.log('녹음 권한 요청 중...');
        const { status } = await Audio.requestPermissionsAsync();

        if (status !== 'granted') {
          Alert.alert('권한 필요', '음성 녹음 권한이 필요합니다.');
          return;
        }

        console.log('오디오 모드 설정 중...');
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        console.log('녹음 시작...');
        const { recording } = await Audio.Recording.createAsync({
          isMeteringEnabled: true,
          android: {
            extension: '.wav',
            outputFormat: Audio.AndroidOutputFormat.DEFAULT,
            audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
          },
          ios: {
            extension: '.wav',
            outputFormat: Audio.IOSOutputFormat.LINEARPCM,
            audioQuality: Audio.IOSAudioQuality.HIGH,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
          },
          web: {
            mimeType: 'audio/wav',
            bitsPerSecond: 128000,
          },
        });

        recordingRef.current = recording;
        setIsRecording(true);
      } catch (error) {
        console.error('녹음 시작 오류:', error);
        Alert.alert('오류', '녹음을 시작하는데 실패했습니다.');
      }
    }
  };

  const playRecording = async () => {
    try {
      if (!recordingUri) {
        Alert.alert('오류', '재생할 녹음 파일이 없습니다.');
        return;
      }

      console.log('녹음 재생 중:', recordingUri);

      // 기존 사운드가 있으면 언로드
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: recordingUri },
        { shouldPlay: true }
      );

      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.error('재생 오류:', error);
      Alert.alert('오류', '녹음을 재생하는데 실패했습니다.');
    }
  };

  const saveRecording = async () => {
    if (!recordingUri) {
      Alert.alert('오류', '저장할 녹음 파일이 없습니다.');
      return;
    }

    if (!currentProfile) {
      Alert.alert('오류', '프로필 정보를 찾을 수 없습니다.');
      return;
    }

    setIsSaving(true);

    try {
      console.log('음성 파일 업로드 시작:', recordingUri);

      // FormData 생성
      const formData = new FormData();
      formData.append('name', `${currentProfile.name} Voice`);
      formData.append('files', {
        uri: recordingUri,
        type: 'audio/wav',
        name: 'voice.wav',
      } as any);

      // 음성 등록 API 호출 (PATCH /api/profiles/:profileId/voice)
      const result = await createProfileVoice(
        String(currentProfile.profileId),
        formData
      );
      console.log('음성 등록 결과:', result);

      const voiceMediaId = result.voiceId;

      // Zustand store 업데이트
      setCurrentProfile({
        ...currentProfile,
        voiceMediaId: voiceMediaId,
      });

      Alert.alert('성공', '음성이 저장되었습니다.', [
        { text: '확인', onPress: onBack },
      ]);
    } catch (error: any) {
      console.error('음성 저장 오류:', error);
      Alert.alert('오류', '음성 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <ArrowLeft size={20} color="#6B7280" />
          <Text style={styles.backText}>뒤로 가기</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>AI 음성 {hasExistingVoice ? '수정' : '등록'}</Text>
          <Text style={styles.headerSubtitle}>내 목소리로 AI가 아이에게 답변해요</Text>
        </View>

        {/* Instructions Box */}
        <View style={styles.instructionBox}>
          <Text style={styles.instructionText}>버튼을 누른 뒤 읽어주세요</Text>
        </View>

        {/* Sample Text Card */}
        <View style={styles.sampleCard}>
          <Text style={styles.sampleTitle}>읽을 문장</Text>
          <Text style={styles.sampleText}>{SAMPLE_TEXT}</Text>
        </View>

        {/* Recording Button */}
        <View style={styles.recordingSection}>
          <TouchableOpacity onPress={toggleRecording} activeOpacity={0.8}>
            <Animated.View
              style={[
                styles.recordButton,
                {
                  transform: [{ scale: isRecording ? pulseAnim : 1 }],
                },
              ]}
            >
              <LinearGradient
                colors={isRecording ? ['#EF4444', '#DC2626'] : ['#5B9BD5', '#4A8BC2']}
                style={styles.recordButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {isRecording ? (
                  <StopCircle size={64} color="#FFFFFF" />
                ) : (
                  <Mic size={64} color="#FFFFFF" />
                )}
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>

          <View style={styles.statusContainer}>
            {isRecording ? (
              <>
                <Text style={[styles.statusTitle, styles.recordingStatus]}>녹음 중...</Text>
                <Text style={styles.statusSubtitle}>버튼을 눌러 종료하세요</Text>
              </>
            ) : hasRecorded ? (
              <>
                <Text style={[styles.statusTitle, styles.completedStatus]}>녹음 완료!</Text>
                <Text style={styles.statusSubtitle}>재생하거나 다시 녹음하세요</Text>
              </>
            ) : (
              <>
                <Text style={styles.statusTitle}>음성 등록 시작</Text>
                <Text style={styles.statusSubtitle}>버튼을 눌러 녹음을 시작하세요</Text>
              </>
            )}
          </View>
        </View>

        {/* Action Buttons (shown after recording) */}
        {hasRecorded && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.playButton}
              onPress={playRecording}
              activeOpacity={0.7}
            >
              <Play size={20} color="#5B9BD5" />
              <Text style={styles.playButtonText}>녹음된 음성 재생</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveRecording}
              activeOpacity={0.7}
              disabled={isSaving}
            >
              <LinearGradient
                colors={['#5B9BD5', '#4A8BC2']}
                style={styles.saveButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {hasExistingVoice ? '음성 수정하기' : '음성 저장하기'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>💡 안내사항</Text>
          <View style={styles.infoList}>
            <Text style={styles.infoItem}>• 조용한 환경에서 녹음해주세요</Text>
            <Text style={styles.infoItem}>• 마이크에 가까이서 또렷하게 읽어주세요</Text>
            <Text style={styles.infoItem}>• 자연스러운 속도로 읽어주세요</Text>
            <Text style={styles.infoItem}>• 녹음된 음성은 AI 학습에 사용됩니다</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  backText: {
    ...typography.body1,
    color: '#6B7280',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.body1,
    color: '#6B7280',
    textAlign: 'center',
  },
  instructionBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: '#5B9BD5',
    marginBottom: spacing.xl,
  },
  instructionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  sampleCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.sm,
    marginBottom: spacing.xl,
  },
  sampleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: spacing.md,
  },
  sampleText: {
    fontSize: 20,
    color: '#1F2937',
    lineHeight: 32,
  },
  recordingSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  recordButton: {
    width: 128,
    height: 128,
    borderRadius: 64,
    ...shadows.lg,
    marginBottom: spacing.lg,
  },
  recordButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: spacing.xs,
  },
  recordingStatus: {
    color: '#EF4444',
  },
  completedStatus: {
    color: '#10B981',
  },
  statusSubtitle: {
    ...typography.body1,
    color: '#6B7280',
  },
  actionButtons: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#5B9BD5',
    backgroundColor: '#FFFFFF',
    gap: spacing.sm,
  },
  playButtonText: {
    fontSize: 18,
    color: '#5B9BD5',
    fontWeight: '600',
  },
  saveButton: {
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: spacing.sm,
  },
  infoList: {
    gap: spacing.xs,
  },
  infoItem: {
    ...typography.body1,
    color: '#374151',
  },
});
