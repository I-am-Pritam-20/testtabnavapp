import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  LayoutChangeEvent,
  Platform,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  FadeOut,
  SharedValue,
} from 'react-native-reanimated';

// ----------------------------------------------------------------------------
// Config
// ----------------------------------------------------------------------------

const BALL_SIZE = 72;
const BALL_RADIUS = BALL_SIZE / 2;
const GAP = 14; // visible gap enforced between ball and pills
const NAV_BACKGROUND = '#111111';
const ACTIVE_BALL_COLOR = '#5B5CFF';
const ACTIVE_TEXT_COLOR = '#FFFFFF';
const INACTIVE_TEXT_COLOR = '#BBBBBB';

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
  centerX: number;
};

// ----------------------------------------------------------------------------
// Inactive tab pill item
// ----------------------------------------------------------------------------

function InactiveTabItem({
  routeName,
  label,
  onPress,
  onLayout,
}: {
  routeName: string;
  label: string;
  onPress: () => void;
  onLayout: (e: LayoutChangeEvent) => void;
}) {
  const icon = ICONS[routeName]?.inactive ?? 'ellipse-outline';

  return (
    <Pressable
      onLayout={onLayout}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.inactiveItem}
      hitSlop={8}
    >
      <Ionicons name={icon} size={22} color={INACTIVE_TEXT_COLOR} />
      <Text style={styles.inactiveLabel}>{label}</Text>
    </Pressable>
  );
}

// ----------------------------------------------------------------------------
// Pill container (Left / Right)
// ----------------------------------------------------------------------------

function Pill({
  children,
  visible,
}: {
  children: React.ReactNode;
  visible: boolean;
}) {
  if (!visible) {
    return null;
  }
  return (
    <Animated.View
      entering={FadeIn.duration(150)}
      exiting={FadeOut.duration(150)}
      style={styles.pill}
    >
      {children}
    </Animated.View>
  );
}

// ----------------------------------------------------------------------------
// Floating ball
// ----------------------------------------------------------------------------

function FloatingBall({
  routeName,
  label,
  translateX,
}: {
  routeName: string;
  label: string;
  translateX: SharedValue<number>;
}) {
  const icon = ICONS[routeName]?.active ?? 'ellipse';

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View
      style={[styles.ballWrapper, animatedStyle]}
      accessibilityRole="button"
      accessibilityLabel={`${label}, active tab`}
      pointerEvents="none"
    >
      <View style={styles.ball}>
        <Ionicons name={icon} size={24} color={ACTIVE_TEXT_COLOR} />
        <Text style={styles.activeLabel}>{label}</Text>
      </View>
    </Animated.View>
  );
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

  // Measured center of the *container* (used to position the ball absolutely).
  const containerWidth = useRef(0);
  const [containerReady, setContainerReady] = useState(false);

  // Per-tab measurements, keyed by route key. Only inactive tabs render
  // inside pills and get measured via onLayout; the ball's target position
  // is computed from the active tab's slot within the full-width track.
  const measurements = useRef<Record<string, TabMeasurement>>({});
  const [, forceUpdate] = useState(0);

  const ballTranslateX = useSharedValue(0);
  const hasPositionedOnce = useRef(false);

  const activeIndex = state.index;
  const activeRoute = state.routes[activeIndex];
  const activeLabel = getLabel(descriptors, activeRoute.key, activeRoute.name);

  const leftRoutes = state.routes.slice(0, activeIndex);
  const rightRoutes = state.routes.slice(activeIndex + 1);

  const handleContainerLayout = useCallback((e: LayoutChangeEvent) => {
    containerWidth.current = e.nativeEvent.layout.width;
    setContainerReady(true);
  }, []);

  // We position the ball by measuring an invisible full-width track of
  // "slots" (one per tab, evenly distributed) so its resting center is
  // stable and independent of pill width animations. This satisfies the
  // "no hardcoded positions" requirement — slot centers are derived from
  // the measured container width divided by tab count, not literals.
  const getSlotCenter = useCallback(
    (index: number) => {
      const total = state.routes.length;
      if (containerWidth.current === 0) return 0;
      const slotWidth = containerWidth.current / total;
      return slotWidth * index + slotWidth / 2;
    },
    [state.routes.length],
  );

  React.useEffect(() => {
    if (!containerReady) return;
    const target = getSlotCenter(activeIndex) - BALL_RADIUS;
    if (!hasPositionedOnce.current) {
      ballTranslateX.value = target;
      hasPositionedOnce.current = true;
    } else {
      ballTranslateX.value = withSpring(target, {
        damping: 16,
        stiffness: 160,
        mass: 0.9,
      });
    }
  }, [activeIndex, containerReady, getSlotCenter, ballTranslateX]);

  const handleTabLayout = useCallback(
    (routeKey: string) => (e: LayoutChangeEvent) => {
      const { x, width } = e.nativeEvent.layout;
      measurements.current[routeKey] = {
        x,
        width,
        centerX: x + width / 2,
      };
      forceUpdate(v => v + 1);
    },
    [],
  );

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
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12) }]}
      onLayout={handleContainerLayout}
    >
      <View style={styles.track}>
        <Pill visible={leftRoutes.length > 0}>
          {leftRoutes.map(route => {
            const label = getLabel(descriptors, route.key, route.name);
            return (
              <InactiveTabItem
                key={route.key}
                routeName={route.name}
                label={label}
                onLayout={handleTabLayout(route.key)}
                onPress={() => onPressTab(route, false)}
              />
            );
          })}
        </Pill>

        {/* Spacer reserves visual room; ball itself is absolutely positioned */}
        <View style={{ width: BALL_SIZE + GAP * 2 }} />

        <Pill visible={rightRoutes.length > 0}>
          {rightRoutes.map(route => {
            const label = getLabel(descriptors, route.key, route.name);
            return (
              <InactiveTabItem
                key={route.key}
                routeName={route.name}
                label={label}
                onLayout={handleTabLayout(route.key)}
                onPress={() => onPressTab(route, false)}
              />
            );
          })}
        </Pill>
      </View>

      {containerReady && (
        <FloatingBall
          routeName={activeRoute.name}
          label={activeLabel}
          translateX={ballTranslateX}
        />
      )}
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
    paddingTop: 14,
    paddingHorizontal: 16,
    position: 'relative',
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 28,
    paddingHorizontal: 14,
    height: 56,
    gap: 18,
  },
  inactiveItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
  },
  inactiveLabel: {
    color: INACTIVE_TEXT_COLOR,
    fontSize: 11,
    fontWeight: '400',
    marginTop: 2,
  },
  ballWrapper: {
    position: 'absolute',
    top: -16, // lifts the ball above the pill row so it reads as detached
    left: 0,
  },
  ball: {
    width: BALL_SIZE,
    height: BALL_SIZE,
    borderRadius: BALL_RADIUS,
    backgroundColor: ACTIVE_BALL_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      android: {
        elevation: 10,
      },
      ios: {
        shadowColor: '#000000',
        shadowOpacity: 0.35,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
      },
    }),
  },
  activeLabel: {
    color: ACTIVE_TEXT_COLOR,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
});