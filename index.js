/**
 * React Native 엔트리포인트
 *
 * 앱 등록 및 초기화
 */

import { AppRegistry } from 'react-native';
import App from './src/app/App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
