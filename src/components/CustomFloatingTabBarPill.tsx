import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  LayoutChangeEvent,
  Platform,
  Dimensions
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  SharedValue,
} from 'react-native-reanimated';

// ----------------------------------------------------------------------------
// Config
// ----------------------------------------------------------------------------

const NAV_BACKGROUND = 'transparent';
const TRACK_BACKGROUND = '#1C1C1E';
const FOCUS_PILL_COLOR = '#2C2C2E'; // subtle iOS-style focus pill, sits *inside* the track
const ACTIVE_TEXT_COLOR = '#FFFFFF';
const INACTIVE_TEXT_COLOR = '#8E8E93';
const ITEM_HEIGHT = 64;
const ITEM_H_PADDING = 16;

type IconName =
  | 'home'
  | 'search'
  | 'person'
  | 'settings'
  | 'home-outline'
  | 'search-outline'
  | 'person-outline'
  | 'settings-outline';

const ICONS: Record<string, { active: IconName; inactive: IconName }> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Search: { active: 'search', inactive: 'search-outline' },
  Account: { active: 'person', inactive: 'person-outline' },
  Settings: { active: 'settings', inactive: 'settings-outline' },
};

// ----------------------------------------------------------------------------
// Layout measurement types
// ----------------------------------------------------------------------------

type TabMeasurement = {
  x: number;
  width: number;
};

// ----------------------------------------------------------------------------
// Tab item — icon + label, color driven by focus state. On iOS-style focus
// pill bars, the *active* item usually shows the label alongside the icon
// while inactive items stay icon-only (or icon + smaller label); here we
// keep icon+label for every item since the spec's four tabs all need labels,
// but weight/color still shift on focus.
// ----------------------------------------------------------------------------

function TabItem({
  routeName,
  label,
  focused,
  onPress,
  onLayout,
}: {
  routeName: string;
  label: string;
  focused: boolean;
  onPress: () => void;
  onLayout: (e: LayoutChangeEvent) => void;
}) {
  const icon = focused
    ? ICONS[routeName]?.active ?? 'ellipse'
    : ICONS[routeName]?.inactive ?? 'ellipse-outline';
  const color = focused ? ACTIVE_TEXT_COLOR : INACTIVE_TEXT_COLOR;

  return (
    <Pressable
      onLayout={onLayout}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
      style={styles.item}
      hitSlop={8}
    >
      <Ionicons name={icon} size={20} color={color} />
      <Text
        style={[
          styles.itemLabel,
          { color, fontWeight: focused ? '700' : '400' },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// ----------------------------------------------------------------------------
// Sliding focus pill — an animated rounded-rect that sits *behind* the
// active tab item and slides/resizes to match its measured bounds.
// ----------------------------------------------------------------------------

function FocusPill({
  x,
  width,
}: {
  x: SharedValue<number>;
  width: SharedValue<number>;
}) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
    width: width.value,
  }));

  return <Animated.View pointerEvents="none" style={[styles.focusPill, animatedStyle]} />;
}

// ----------------------------------------------------------------------------
// Main tab bar
// ----------------------------------------------------------------------------

export default function CustomFloatingTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const WIDTH = Dimensions.get('window').width;
  // Per-tab measurements, keyed by route key, populated via onLayout —
  // no hardcoded positions anywhere.
  const measurements = useRef<Record<string, TabMeasurement>>({});

  const pillX = useSharedValue(0);
  const pillWidth = useSharedValue(0);
  const hasPositionedOnce = useRef(false);

  const activeIndex = state.index;
  const activeRoute = state.routes[activeIndex];

  const movePillTo = useCallback(
    (routeKey: string) => {
      const m = measurements.current[routeKey];
      if (!m) return;

      if (!hasPositionedOnce.current) {
        pillX.value = m.x;
        pillWidth.value = m.width;
        hasPositionedOnce.current = true;
      } else {
        pillX.value = withSpring(m.x, { damping: 18, stiffness: 200, mass: 0.8 });
        pillWidth.value = withSpring(m.width, { damping: 18, stiffness: 200, mass: 0.8 });
      }
    },
    [pillX, pillWidth],
  );

  const handleTabLayout = useCallback(
    (routeKey: string, isActive: boolean) => (e: LayoutChangeEvent) => {
      const { x, width } = e.nativeEvent.layout;
      measurements.current[routeKey] = { x, width };
      // Once the active tab's own layout resolves, snap/animate the pill
      // to it. This also re-centers the pill if screen size/orientation
      // changes, since onLayout re-fires on resize.
      if (isActive) {
        movePillTo(routeKey);
      }
    },
    [movePillTo],
  );

  // If the active tab changes and we already have a measurement for it
  // (e.g. navigating back to a previously-measured tab), animate directly
  // without waiting for another onLayout pass.
  React.useEffect(() => {
    const key = activeRoute.key;
    if (measurements.current[key]) {
      movePillTo(key);
    }
  }, [activeRoute.key, movePillTo]);

  const onPressTab = useCallback(
    (route: (typeof state.routes)[number], isFocused: boolean) => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    },
    [navigation],
  );

  return (
    <View
      style={[styles.container, { width: WIDTH - 28, bottom: insets.bottom >= 44 ? insets.bottom : 14 }]}
    >
      <View style={styles.track}>
        <FocusPill x={pillX} width={pillWidth} />

        {state.routes.map((route, index) => {
          const focused = index === activeIndex;
          const label = getLabel(descriptors, route.key, route.name);
          return (
            <TabItem
              key={route.key}
              routeName={route.name}
              label={label}
              focused={focused}
              onLayout={handleTabLayout(route.key, focused)}
              onPress={() => onPressTab(route, focused)}
            />
          );
        })}
      </View>
    </View>
  );
}

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

function getLabel(
  descriptors: BottomTabBarProps['descriptors'],
  routeKey: string,
  routeName: string,
): string {
  const options = descriptors[routeKey]?.options;
  const tabBarLabel = options?.tabBarLabel;
  if (typeof tabBarLabel === 'string') return tabBarLabel;
  return options?.title ?? routeName;
}

// ----------------------------------------------------------------------------
// Styles
// ----------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    backgroundColor: NAV_BACKGROUND,
    position: 'absolute',
    zIndex: 150, 
    marginHorizontal: 16,
    alignSelf: 'center'
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4, 
    backgroundColor: TRACK_BACKGROUND,
    borderRadius: 80,
    height: ITEM_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      android: {
        elevation: 6,
      },
      ios: {
        shadowColor: '#000000',
        shadowOpacity: 0.25,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
    }),
  },
  focusPill: {
    position: 'absolute',
    top: 4,
    left: 0,
    height: ITEM_HEIGHT - 8,
    borderRadius: 40,
    backgroundColor: FOCUS_PILL_COLOR,
  },
  item: {
    flex: 1,
    height: ITEM_HEIGHT,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: ITEM_H_PADDING,
    gap: 4,
  },
  itemLabel: {
    fontSize: 13,
  },
});