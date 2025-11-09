/**
 * 자녀 앱 네비게이터
 * - 탭 네비게이션: 대화, 퀴즈
 * - 자녀용 화면 스택
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChatScreen from '../../screens/child/Chat';
import ChatDetailScreen from '../../screens/child/ChatDetail';
import QuizScreen from '../../screens/child/Quiz';

export type ChildTabParamList = {
  Chat: undefined;
  Quiz: undefined;
};

export type ChildStackParamList = {
  ChatDetail: { conversationId: string };
};

const Tab = createBottomTabNavigator<ChildTabParamList>();
const Stack = createNativeStackNavigator<ChildStackParamList>();

function ChatStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ChatDetail" component={ChatDetailScreen} options={{ title: '대화 상세' }} />
    </Stack.Navigator>
  );
}

export function ChildNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Chat" component={ChatStack} options={{ title: '대화' }} />
      <Tab.Screen name="Quiz" component={QuizScreen} options={{ title: '퀴즈' }} />
    </Tab.Navigator>
  );
}
