import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {ErrorBoundary} from './components/ErrorBoundary.tsx';
import {NativeStageHost} from './components/NativeStageHost.tsx';
import {BrowserEditorHost} from './components/BrowserEditorHost.tsx';
import {getNativeStageLaunch} from './utils/nativeScreens.ts';
import {setStageVisible} from './utils/stageVisibility.ts';
import './index.css';
import './utils/kotlinSyntaxAssets.ts';

// This web bundle now serves only editor stages embedded in the React Native app.
getNativeStageLaunch().then((launch) => {
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
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <BrowserEditorHost />
      </ErrorBoundary>
    </StrictMode>,
  );
});
