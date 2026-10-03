import React from 'react';
import { PanResponder, ScrollView, View } from 'react-native';

/** A code viewport that claims only clearly horizontal gestures. Vertical gestures bubble to the lesson ScrollView. */
export function HorizontalCodeScroll({ children }: { children: React.ReactNode }) {
  const scrollRef = React.useRef<ScrollView>(null);
  const startX = React.useRef(0);
  const startOffset = React.useRef(0);
  const offset = React.useRef(0);
  const contentWidth = React.useRef(0);
  const viewportWidth = React.useRef(0);
  const pan = React.useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_, gesture) => {
      const horizontal = Math.abs(gesture.dx);
      const vertical = Math.abs(gesture.dy);
      return horizontal > 8 && horizontal > vertical * 1.25 && contentWidth.current > viewportWidth.current + 1;
    },
    onPanResponderGrant: (_, gesture) => {
      startX.current = gesture.x0;
      startOffset.current = offset.current;
    },
    onPanResponderMove: (_, gesture) => {
      const max = Math.max(0, contentWidth.current - viewportWidth.current);
      const next = Math.max(0, Math.min(max, startOffset.current - (gesture.moveX - startX.current)));
      offset.current = next;
      scrollRef.current?.scrollTo({ x: next, animated: false });
    },
    onPanResponderRelease: () => {},
    onPanResponderTerminate: () => {},
    onShouldBlockNativeResponder: () => false,
  }), []);

  return (
    <View {...pan.panHandlers} style={{ alignSelf: 'stretch' }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled
        contentContainerStyle={{ flexGrow: 0 }}
        onLayout={(event) => { viewportWidth.current = event.nativeEvent.layout.width; }}
        onContentSizeChange={(width) => { contentWidth.current = width; }}
      >
        <View style={{ alignSelf: 'flex-start' }}>{children}</View>
      </ScrollView>
    </View>
  );
}
