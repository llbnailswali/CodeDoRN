import { nativeScreensAvailable, readNativeClipboard, writeNativeClipboard } from './nativeScreens';

// Clipboard in an Android WebView can be unavailable, so fall back to a hidden textarea.
export async function copyText(text: string): Promise<boolean> {
  if (nativeScreensAvailable()) {
    try {
      await writeNativeClipboard(text);
      return true;
    } catch {
      // an older app build without the method: use the browser paths below
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

/** The clipboard's text: through the Android app when present, else the browser. Throws when neither can read it. */
export async function readClipboardText(): Promise<string> {
  if (nativeScreensAvailable()) {
    try {
      return await readNativeClipboard();
    } catch {
      // an older app build without the method: use the browser path below
    }
  }
  return (await navigator.clipboard?.readText?.()) ?? '';
}
