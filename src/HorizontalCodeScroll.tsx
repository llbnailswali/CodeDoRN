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
export function HorizontalCodeScroll({ children, inset = 0 }: { children: React.ReactNode; inset?: number }) {
  return (
    <View style={{ alignSelf: 'stretch' }}>
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
