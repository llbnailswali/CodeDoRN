// Keep the conventional React Native entry file pointed at the same app as
// the native index entry. This prevents alternate run configurations and
// tests from loading the old template screen.
export { App as default, App } from './src/App';
