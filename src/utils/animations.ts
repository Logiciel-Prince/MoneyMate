import { useEffect } from 'react';
import {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

/**
 * Spring animation configuration
 */
export const springConfig = {
    damping: 15,
    stiffness: 150,
    mass: 0.5,
};

export const softSpringConfig = {
    damping: 20,
    stiffness: 100,
    mass: 0.8,
};

/**
 * Timing animation configuration
 */
export const timingConfig = {
    duration: 300,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
};

export const slowTimingConfig = {
    duration: 500,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
};

/**
 * Fade in animation hook
 */
export const useFadeIn = (delay = 0, duration = 400) => {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(20);

    useEffect(() => {
        opacity.value = withDelay(
            delay,
            withTiming(1, { duration, easing: Easing.out(Easing.ease) })
        );
        translateY.value = withDelay(
            delay,
            withSpring(0, springConfig)
        );
    }, [delay, duration]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    return animatedStyle;
};

/**
 * Scale in animation hook
 */
export const useScaleIn = (delay = 0, duration = 300) => {
    const scale = useSharedValue(0.8);
    const opacity = useSharedValue(0);

    useEffect(() => {
        scale.value = withDelay(
            delay,
            withSpring(1, springConfig)
        );
        opacity.value = withDelay(
            delay,
            withTiming(1, { duration, easing: Easing.out(Easing.ease) })
        );
    }, [delay, duration]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: scale.value }],
    }));

    return animatedStyle;
};

/**
 * Slide in from right animation hook
 */
export const useSlideInRight = (delay = 0) => {
    const translateX = useSharedValue(100);
    const opacity = useSharedValue(0);

    useEffect(() => {
        translateX.value = withDelay(
            delay,
            withSpring(0, springConfig)
        );
        opacity.value = withDelay(
            delay,
            withTiming(1, { duration: 300 })
        );
    }, [delay]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateX: translateX.value }],
    }));

    return animatedStyle;
};

/**
 * Slide in from left animation hook
 */
export const useSlideInLeft = (delay = 0) => {
    const translateX = useSharedValue(-100);
    const opacity = useSharedValue(0);

    useEffect(() => {
        translateX.value = withDelay(
            delay,
            withSpring(0, springConfig)
        );
        opacity.value = withDelay(
            delay,
            withTiming(1, { duration: 300 })
        );
    }, [delay]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateX: translateX.value }],
    }));

    return animatedStyle;
};

/**
 * Bounce animation hook (for FAB buttons)
 */
export const useBounceIn = (delay = 0) => {
    const scale = useSharedValue(0);

    useEffect(() => {
        scale.value = withDelay(
            delay,
            withSequence(
                withSpring(1.2, { damping: 8, stiffness: 200 }),
                withSpring(1, springConfig)
            )
        );
    }, [delay]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return animatedStyle;
};

/**
 * Pulse animation hook (for notifications, badges)
 */
export const usePulse = (shouldPulse = true) => {
    const scale = useSharedValue(1);

    useEffect(() => {
        if (shouldPulse) {
            scale.value = withRepeat(
                withSequence(
                    withTiming(1.1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                false
            );
        } else {
            scale.value = withTiming(1, { duration: 200 });
        }
    }, [shouldPulse]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return animatedStyle;
};

/**
 * Press scale animation
 */
export const usePressScale = () => {
    const scale = useSharedValue(1);

    const onPressIn = () => {
        scale.value = withSpring(0.95, { damping: 10, stiffness: 400 });
    };

    const onPressOut = () => {
        scale.value = withSpring(1, springConfig);
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return { animatedStyle, onPressIn, onPressOut };
};

/**
 * Rotate animation hook (for loading spinners)
 */
export const useRotate = (shouldRotate = true) => {
    const rotation = useSharedValue(0);

    useEffect(() => {
        if (shouldRotate) {
            rotation.value = withRepeat(
                withTiming(360, { duration: 1000, easing: Easing.linear }),
                -1,
                false
            );
        } else {
            rotation.value = withTiming(0, { duration: 200 });
        }
    }, [shouldRotate]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }));

    return animatedStyle;
};

/**
 * Progress bar animation
 */
export const useProgressBar = (progress: number, duration = 500) => {
    const width = useSharedValue(0);

    useEffect(() => {
        width.value = withTiming(progress, {
            duration,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
    }, [progress, duration]);

    const animatedStyle = useAnimatedStyle(() => ({
        width: `${width.value}%`,
    }));

    return animatedStyle;
};

/**
 * Shake animation (for errors)
 */
export const useShake = (trigger: boolean) => {
    const translateX = useSharedValue(0);

    useEffect(() => {
        if (trigger) {
            translateX.value = withSequence(
                withTiming(-10, { duration: 50 }),
                withTiming(10, { duration: 50 }),
                withTiming(-10, { duration: 50 }),
                withTiming(10, { duration: 50 }),
                withTiming(0, { duration: 50 })
            );
        }
    }, [trigger]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    return animatedStyle;
};
