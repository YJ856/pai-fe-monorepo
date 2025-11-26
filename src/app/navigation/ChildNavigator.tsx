/**
 * 자녀 앱 네비게이터
 * - 탭 네비게이션: 대화, 퀴즈
 * - 자녀용 화면 스택
 * - 메인 대화 화면: ChatDetail (단일 대화 포커스 모드)
 */

import React, { useEffect, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MessageCircle, FileQuestion, User } from 'lucide-react-native';
import { useIsFocused } from '@react-navigation/native';
import ChatScreen from '../../screens/child/Chat';
import ChatDetailScreen from '../../screens/child/ChatDetail';
import QuizScreen from '../../screens/child/Quiz';
import ProfileScreen from '../../screens/child/Profile';
import { colors } from '../../design/tokens';
import { ChatProvider, useChatContext } from '../../contexts/ChatContext';
import { endConversation } from '../../api/conversations';

export type ChildTabParamList = {
  Chat: undefined;
  Quiz: undefined;
  Profile: undefined;
};

export type ChildStackParamList = {
  ChatDetail: undefined;
  ChatList: undefined;
};

const Tab = createBottomTabNavigator<ChildTabParamList>();
const Stack = createNativeStackNavigator<ChildStackParamList>();

function ChatStackContent() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ChatDetail" component={ChatDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ChatList" component={ChatScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function ChatStack() {
  const isFocused = useIsFocused();
  const previousFocusedRef = useRef(isFocused);

  return (
    <ChatProvider>
      <ChatStackUnmountHandler />
      <ChatStackContent />
    </ChatProvider>
  );
}

// Chat 탭을 벗어날 때 대화 종료 처리
function ChatStackUnmountHandler() {
  const isFocused = useIsFocused();
  const { conversationSessionId, clearChat } = useChatContext();
  const previousFocusedRef = useRef(isFocused);

  useEffect(() => {
    // 탭에서 벗어날 때 (focused: true -> false)
    if (previousFocusedRef.current && !isFocused && conversationSessionId) {
      console.log('[ChatStack] Chat 탭 벗어남 - 대화 종료:', conversationSessionId);

      // 대화 종료 API 호출
      endConversation({ conversationSessionId })
        .then(() => {
          console.log('[ChatStack] 대화 종료 완료');
        })
        .catch((error: any) => {
          // 404는 이미 종료되었거나 세션이 없는 경우이므로 무시
          if (error?.response?.status === 404) {
            console.log('[ChatStack] 대화 세션이 이미 종료되었거나 존재하지 않음');
          } else {
            console.error('[ChatStack] 대화 종료 에러:', error);
          }
        });

      // 캐시 초기화
      clearChat();
    }

    previousFocusedRef.current = isFocused;
  }, [isFocused, conversationSessionId, clearChat]);

  return null;
}

export function ChildNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.child.from,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Chat"
        component={ChatStack}
        options={{
          title: '대화',
          tabBarIcon: ({ color, size }) => <MessageCircle size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Quiz"
        component={QuizScreen}
        options={{
          title: '퀴즈',
          tabBarIcon: ({ color, size }) => <FileQuestion size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: '프로필',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
