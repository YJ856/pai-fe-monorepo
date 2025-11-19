/**
 * 부모 앱 네비게이터
 * - 탭 네비게이션: 대화, 퀴즈, 대시보드, 프로필
 * - 부모용 화면 스택 (대시보드 내 활동 서브 라우트 포함)
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MessageCircle, FileQuestion, LayoutDashboard, User } from 'lucide-react-native';
import ChatScreen from '../../screens/parent/Chat';
import QuizScreen from '../../screens/parent/Quiz';
import DashboardScreen from '../../screens/parent/Dashboard';
import ProfileScreen from '../../screens/parent/Profile';
import { colors } from '../../design/tokens';

// 대시보드 활동 서브 스크린
import ActivityGalleryScreen from '../../screens/parent/Dashboard/activity/Gallery';

export type ParentTabParamList = {
  Chat: undefined;
  Quiz: undefined;
  Dashboard: undefined;
  Profile: undefined;
};

export type ParentStackParamList = {
  DashboardMain: undefined;
  ActivityGallery: { childId: string; date: string };
  ActivityDetail: { conversationId: string };
};

const Tab = createBottomTabNavigator<ParentTabParamList>();
const Stack = createNativeStackNavigator<ParentStackParamList>();

function DashboardStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="DashboardMain"
        component={DashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ActivityGallery"
        component={ActivityGalleryScreen}
        options={{
          title: '대화 갤러리',
          headerStyle: {
            backgroundColor: '#EFF6FF',
          },
          headerTintColor: colors.parent.from,
        }}
      />
      {/* TODO: ActivityDetail 화면 추가 */}
    </Stack.Navigator>
  );
}

export function ParentNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.parent.from,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
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
        name="Dashboard"
        component={DashboardStack}
        options={{
          title: '대시보드',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
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
