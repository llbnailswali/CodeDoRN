import React from 'react';
import { ScrollView, View } from 'react-native';

/**
 * A code viewport that scrolls sideways when a line is wider than the screen (the web's overflow-x-auto + whitespace-pre).
 * It is a plain native horizontal ScrollView: Android hands horizontal drags to it and vertical drags to the lesson
 * ScrollView around it. (A JS PanResponder driving a non-scrolling ScrollView lost the gesture whenever the code sat inside
 * a Pressable, such as an Explore card, so sideways scrolling did nothing there.)
 *
 * `inset` is the left/right margin around the code. It sits INSIDE the scrolling content, so the code starts with that margin
 * but scrolls all the way to the viewport edge (padding outside the ScrollView would clip the code at the padding line).
 */
/**
 * Set by a horizontal pager around the code (the quiz's question pager). On Android the pager claims sideways drags before
 * this ScrollView sees them, so code inside a quiz page could not scroll. A touch on the code calls this with `true` (pause
 * the pager's swiping) and lifting the finger calls it with `false`.
 */
export const CodeScrollPagerLock = React.createContext<(locked: boolean) => void>(() => {});

export function HorizontalCodeScroll({ children, inset = 0 }: { children: React.ReactNode; inset?: number }) {
  const lockPager = React.useContext(CodeScrollPagerLock);
  return (
    <View style={{ alignSelf: 'stretch' }} onTouchStart={() => lockPager(true)} onTouchEnd={() => lockPager(false)} onTouchCancel={() => lockPager(false)}>
      <ScrollView
        horizontal
        nestedScrollEnabled
        directionalLockEnabled
        bounces={false}
        overScrollMode="never"
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 0, paddingHorizontal: inset }}
      >
        <View style={{ alignSelf: 'flex-start' }}>{children}</View>
      </ScrollView>
    </View>
  );
}
