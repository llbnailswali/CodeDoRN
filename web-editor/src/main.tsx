import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {ErrorBoundary} from './components/ErrorBoundary.tsx';
import {NativeStageHost} from './components/NativeStageHost.tsx';
import {getNativeStageLaunch} from './utils/nativeScreens.ts';
import {setStageVisible} from './utils/stageVisibility.ts';
import './index.css';

// Inside the Android activity the React Native lesson screen opens for a web stage, show only that stage instead of the whole app.
// The full app (and every World's lesson data) is loaded lazily: a stage launch never downloads or parses it.
getNativeStageLaunch().then(async (launch) => {
  const root = createRoot(document.getElementById('root')!);
  if (launch) {
    // The native loading overlay covers the stage until it reports ready (NativeStageHost); things that wait for "visible" start after.
    setStageVisible(false);
    root.render(
      <StrictMode>
        <ErrorBoundary>
          <NativeStageHost launch={launch} />
        </ErrorBoundary>
      </StrictMode>,
    );
    return;
  }
  const {default: App} = await import('./App.tsx');
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
});
