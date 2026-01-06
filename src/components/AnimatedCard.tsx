import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { useFadeIn, usePressScale } from '../utils/animations';

interface AnimatedCardProps {
    children: React.ReactNode;
    delay?: number;
    onPress?: () => void;
    style?: ViewStyle | ViewStyle[];
    disabled?: boolean;
}

/**
 * Animated Card Component
 * Provides fade-in animation on mount and press scale animation on interaction
 */
export const AnimatedCard: React.FC<AnimatedCardProps> = ({
    children,
    delay = 0,
    onPress,
    style,
    disabled = false,
}) => {
    const fadeInStyle = useFadeIn(delay);
    const { animatedStyle: pressStyle, onPressIn, onPressOut } = usePressScale();

    if (onPress && !disabled) {
        return (
            <Animated.View style={[fadeInStyle, pressStyle, style]}>
                <TouchableOpacity
                    onPressIn={onPressIn}
                    onPressOut={onPressOut}
                    onPress={onPress}
                    activeOpacity={1}
                    disabled={disabled}
                    style={styles.touchable}
                >
                    {children}
                </TouchableOpacity>
            </Animated.View>
        );
    }

    return (
        <Animated.View style={[fadeInStyle, style]}>
            {children}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    touchable: {
        flex: 1,
    },
});

export default AnimatedCard;
