# web-editor

Self-contained web editor used for Write & Run (stage 4) and Debug (stage 5). The Android `WebStageActivity`
(Capacitor WebView) shows its build; React Native opens it through `NativeModules.WebStage`.

This is a full copy of the web app project (`../CodeDo`), including the Kotlin runner, lesson data,
practice banks, the test/audit scripts and the lesson-formatting tools. The RN build no longer needs `../CodeDo`.

## Build

```sh
cd web-editor
npm install
npm run build        # writes web-editor/dist
```

`android/app/build.gradle` (`syncWebStageAssets`) copies `dist/` plus `capacitor.config.json` and
`capacitor.plugins.json` into the APK's assets, and fails with a clear message if `dist/` is missing.
Rebuild `dist/` after every change to this folder, then rebuild the Android app.

## Tests and audits

Run from this folder (same commands as the web project): `npm run test:numeric-semantics`,
`test:practice-bank`, `test:class-rules`, `test:lambda-runner`, `test:collection-runner`, `audit:output-quotes`, ...

## Native screens' data

The React Native screens do not read this folder's data directly. Four files in `../src` are generated from it
(`lessonData.ts`, `curriculumData.ts`, `practiceTasks.ts`, `quizSample.ts`). After changing lessons, the curriculum
catalog, the practice bank or the World 1 quiz here, run:

```sh
npm run generate:native-data   # rewrite the four files
npm run check:native-data      # exit 1 if any is out of date (use before committing / in CI)
```

Do not edit those four files by hand. `../src/data` no longer exists: this folder is the only copy of the lesson data.

## Still duplicated



`quizQuestions.ts` and `pathStyles.ts` exist here and in `../src` with small differences (RN-native adaptations).
