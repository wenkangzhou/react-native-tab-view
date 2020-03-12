import * as React from 'react';
import {
  StyleSheet,
  View,
  StyleProp,
  LayoutChangeEvent,
  TextStyle,
  ViewStyle,
} from 'react-native';
import TouchableItem from './TouchableItem';
import { Scene, Route, NavigationState } from './types';
import Animated from 'react-native-reanimated';

type Props<T extends Route> = {
  position: Animated.Node<number>;
  route: T;
  navigationState: NavigationState<T>;
  activeColor?: string;
  inactiveColor?: string;
  pressColor?: string;
  pressOpacity?: number;
  routeIndex: number;
  getLabelText: (scene: Scene<T>) => string | undefined;
  getAccessible: (scene: Scene<T>) => boolean | undefined;
  getAccessibilityLabel: (scene: Scene<T>) => string | undefined;
  getTestID: (scene: Scene<T>) => string | undefined;
  renderLabel?: (scene: {
    route: T;
    focused: boolean;
    color: string;
  }) => React.ReactNode;
  renderIcon?: (scene: {
    route: T;
    focused: boolean;
    color: string;
  }) => React.ReactNode;
  renderBadge?: (scene: Scene<T>) => React.ReactNode;
  onLayout?: (event: LayoutChangeEvent) => void;
  onPress: () => void;
  onLongPress: () => void;
  labelStyle?: StyleProp<TextStyle>;
  style: StyleProp<ViewStyle>;
};

const DEFAULT_ACTIVE_COLOR = 'rgba(255, 255, 255, 1)';
const DEFAULT_INACTIVE_COLOR = 'rgba(255, 255, 255, 0.7)';

export default class TabBarItem<T extends Route> extends React.Component<
  Props<T>
  > {

  render() {
    const {
            route,
            navigationState,
            renderLabel: renderLabelPassed,
            renderIcon,
            renderBadge,
            getLabelText,
            getTestID,
            getAccessibilityLabel,
            getAccessible,
            activeColor = DEFAULT_ACTIVE_COLOR,
            inactiveColor = DEFAULT_INACTIVE_COLOR,
            pressColor,
            pressOpacity,
            labelStyle,
            style,
            onLayout,
            onPress,
            onLongPress,
            routeIndex
          } = this.props;

    const tabIndex = navigationState.routes.indexOf(route);
    const isFocused = navigationState.index === tabIndex;


    let icon: React.ReactNode | null = null;
    let label: React.ReactNode | null = null;

    if (renderIcon) {
      const activeIcon = renderIcon({
        route,
        focused: true,
        color: activeColor,
      });
      const inactiveIcon = renderIcon({
        route,
        focused: false,
        color: inactiveColor,
      });

      if (inactiveIcon != null && activeIcon != null) {
        icon = (
          <View style={styles.icon}>
            {
              routeIndex !== navigationState.index ?
                <View>{inactiveIcon}</View>
                :
                <View>{activeIcon}</View>
            }
          </View>
        );
      }
    }

    const renderLabel =
            renderLabelPassed !== undefined
              ? renderLabelPassed
              : ({ route, color }: { route: T; color: string }) => {
                const labelText = getLabelText({ route });

                if (typeof labelText === 'string') {
                  return (
                    <Animated.Text
                      style={[
                        styles.label,
                        // eslint-disable-next-line react-native/no-inline-styles
                        icon ? { marginTop: 0 } : null,
                        { color },
                        labelStyle,
                      ]}
                    >
                      {labelText}
                    </Animated.Text>
                  );
                }

                return labelText;
              };

    if (renderLabel) {
      const activeLabel = renderLabel({
        route,
        focused: true,
        color: activeColor,
      });
      const inactiveLabel = renderLabel({
        route,
        focused: false,
        color: inactiveColor,
      });

      label = (
        <View>
          {
            routeIndex !== navigationState.index ?
              <View>{inactiveLabel}</View>
              :
              <View>{activeLabel}</View>
          }
        </View>
      );
    }

    const tabStyle = StyleSheet.flatten(style);
    const isWidthSet = tabStyle && tabStyle.width !== undefined;
    const tabContainerStyle: ViewStyle | null = isWidthSet ? null : { flex: 1 };

    const scene = { route };

    let accessibilityLabel = getAccessibilityLabel(scene);

    accessibilityLabel =
      typeof accessibilityLabel !== 'undefined'
        ? accessibilityLabel
        : getLabelText(scene);

    const badge = renderBadge ? renderBadge(scene) : null;

    return (
      <TouchableItem
        borderless
        testID={getTestID(scene)}
        accessible={getAccessible(scene)}
        accessibilityLabel={accessibilityLabel}
        accessibilityTraits={isFocused ? ['button', 'selected'] : 'button'}
        accessibilityComponentType="button"
        accessibilityRole="button"
        accessibilityStates={isFocused ? ['selected'] : []}
        pressColor={pressColor}
        pressOpacity={pressOpacity}
        delayPressIn={0}
        onLayout={onLayout}
        onPress={onPress}
        onLongPress={onLongPress}
        style={tabContainerStyle}
      >
        <View pointerEvents="none" style={[styles.item, tabStyle]}>
          {icon}
          {label}
          {badge != null ? <View style={styles.badge}>{badge}</View> : null}
        </View>
      </TouchableItem>
    );
  }
}

const styles = StyleSheet.create({
  label: {
    margin: 4,
    backgroundColor: 'transparent',
  },
  icon: {
    margin: 2,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    minHeight: 48,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
});
