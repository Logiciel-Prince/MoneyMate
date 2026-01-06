import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Animated from 'react-native-reanimated';
import { usePressScale, useScaleIn } from '../utils/animations';

interface AnimatedFABProps {
    onPress: () => void;
    icon?: keyof typeof MaterialCommunityIcons.glyphMap;
    backgroundColor?: string;
    iconColor?: string;
    iconSize?: number;
    delay?: number;
    style?: any;
}

/**
 * Animated Floating Action Button
 * Provides subtle fade-in with scale animation on mount and press scale animation on interaction
 */
export const AnimatedFAB: React.FC<AnimatedFABProps> = ({
    onPress,
    icon = 'plus',
    backgroundColor = '#2563EB',
    iconColor = '#FFFFFF',
    iconSize = 32,
    delay = 0,
    style,
}) => {
    const scaleInStyle = useScaleIn(delay, 400);
    const { animatedStyle: pressStyle, onPressIn, onPressOut } = usePressScale();

    return (
        <Animated.View style={[styles.fab, scaleInStyle, pressStyle, { backgroundColor }, style]}>
            <TouchableOpacity
                onPress={onPress}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                activeOpacity={1}
                style={styles.touchable}
            >
                <MaterialCommunityIcons name={icon} size={iconSize} color={iconColor} />
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    fab: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    touchable: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default AnimatedFAB;
