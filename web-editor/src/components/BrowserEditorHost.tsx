import React, { useState } from 'react';
import { Stage4WriteRunData } from '../data/lessonStagesData';
import { WriteRun } from './WriteRun';

const STARTER_CODE = `fun main() {
  val language = "Kotlin"
  println("Hello, $language!")
}`;

const BROWSER_EDITOR_DATA: Stage4WriteRunData = {
  challengeNumber: 1,
  totalChallenges: 1,
  xpReward: 0,
  title: 'Kotlin Editor',
  description: 'Edit the sample code, then run it to see the output.',
  requirements: { name: 'main', params: '()', returns: 'Unit' },
  fileName: 'Main.kt',
  initialCode: STARTER_CODE,
  solutionCode: STARTER_CODE,
  sampleInput: '',
  expectedOutput: '',
  testCase: { call: '', expected: '' },
};

export const BrowserEditorHost: React.FC = () => {
  const [userCode, setUserCode] = useState(STARTER_CODE);
  const [hasRunCode, setHasRunCode] = useState(false);
  const [actualOutput, setActualOutput] = useState('');

  return (
    <div className="min-h-screen w-full bg-[#0b0f19]">
      <WriteRun
        data={BROWSER_EDITOR_DATA}
        topicTitle="Kotlin Editor"
        isDark
        userCode={userCode}
        setUserCode={setUserCode}
        hasRunCode={hasRunCode}
        setHasRunCode={setHasRunCode}
        actualOutput={actualOutput}
        setActualOutput={setActualOutput}
        onRunCode={() => setHasRunCode(true)}
        onContinue={() => {}}
        onBack={() => {}}
        tryItMode
      />
    </div>
  );
};
