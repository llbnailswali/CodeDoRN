import { AppRegistry } from 'react-native';
import { App } from './src/App';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// The name must match ReactHomeActivity.getMainComponentName() on the Android side.
AppRegistry.registerComponent('CodeDoRN', () => () => (
  <SafeAreaProvider>
    <App />
  </SafeAreaProvider>
));
