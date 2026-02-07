import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Text,
  Platform,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  Easing,
  withSequence,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

const PARTICLE_COUNT = 12;
const RIPPLE_COUNT = 3;

interface TapEffect {
  id: string;
  x: number;
  y: number;
  color: string;
  timestamp: number;
}

interface ParticleData {
  id: string;
  x: number;
  y: number;
  angle: number;
  distance: number;
  size: number;
  color: string;
  delay: number;
}

function Particle({ data }: { data: ParticleData }) {
  const progress = useSharedValue(0);
  const fadeOut = useSharedValue(1);

  useEffect(() => {
    progress.value = withSpring(1, {
      damping: 8,
      stiffness: 120,
      mass: 0.5,
    });
    fadeOut.value = withDelay(
      200 + data.delay,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) })
    );
  }, []);

  const animStyle = useAnimatedStyle(() => {
    const dx = Math.cos(data.angle) * data.distance * progress.value;
    const dy = Math.sin(data.angle) * data.distance * progress.value;
    const scale = 1 - progress.value * 0.5;

    return {
      transform: [
        { translateX: data.x + dx - data.size / 2 },
        { translateY: data.y + dy - data.size / 2 },
        { scale },
        { rotate: `${progress.value * 360}deg` },
      ],
      opacity: fadeOut.value,
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: data.size,
          height: data.size,
          borderRadius: data.size / 2,
          backgroundColor: data.color,
        },
        animStyle,
      ]}
    />
  );
}

function Ripple({ x, y, color, delay }: { x: number; y: number; color: string; delay: number }) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) })
    );
    opacity.value = withDelay(
      delay,
      withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) })
    );
  }, []);

  const animStyle = useAnimatedStyle(() => {
    const size = 200 + delay * 0.5;
    return {
      transform: [
        { translateX: x - size / 2 },
        { translateY: y - size / 2 },
        { scale: scale.value },
      ],
      opacity: opacity.value,
      width: size,
      height: size,
      borderRadius: size / 2,
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          borderWidth: 2,
          borderColor: color,
        },
        animStyle,
      ]}
    />
  );
}

function FlashOverlay({ color }: { color: string }) {
  const opacity = useSharedValue(0.15);

  useEffect(() => {
    opacity.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.quad) });
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, { backgroundColor: color, pointerEvents: "none" as const }, animStyle]}
    />
  );
}

function GlowDot({ x, y, color }: { x: number; y: number; color: string }) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withSequence(
      withSpring(1.2, { damping: 4, stiffness: 200 }),
      withTiming(0, { duration: 800, easing: Easing.out(Easing.quad) })
    );
    opacity.value = withDelay(
      300,
      withTiming(0, { duration: 600 })
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x - 30 },
      { translateY: y - 30 },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: color,
        },
        animStyle,
      ]}
    />
  );
}

function CounterDisplay({ count }: { count: number }) {
  const insets = useSafeAreaInsets();
  const scale = useSharedValue(1);

  useEffect(() => {
    if (count > 0) {
      scale.value = withSequence(
        withSpring(1.3, { damping: 6, stiffness: 300 }),
        withSpring(1, { damping: 10, stiffness: 200 })
      );
    }
  }, [count]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.counterContainer, { paddingTop: topPadding + 16 }]}>
      <Animated.View style={[styles.counterInner, animStyle]}>
        <Text style={styles.counterNumber}>{count}</Text>
        <Text style={styles.counterLabel}>TAPS</Text>
      </Animated.View>
    </View>
  );
}

function ResetButton({ onReset }: { onReset: () => void }) {
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <Pressable
      onPress={onReset}
      style={({ pressed }) => [
        styles.resetButton,
        { top: topPadding + 16, opacity: pressed ? 0.5 : 0.3 },
      ]}
      hitSlop={20}
    >
      <Ionicons name="refresh" size={20} color="#fff" />
    </Pressable>
  );
}

function HintText({ visible }: { visible: boolean }) {
  const opacity = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, { duration: 500 });
  }, [visible]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.hintContainer, { pointerEvents: "none" as const }, animStyle]}>
      <Text style={styles.hintText}>TAP ANYWHERE</Text>
      <View style={styles.hintPulse}>
        <Ionicons name="finger-print" size={40} color="rgba(255,255,255,0.15)" />
      </View>
    </Animated.View>
  );
}

export default function ShatterScreen() {
  const [tapCount, setTapCount] = useState(0);
  const [effects, setEffects] = useState<TapEffect[]>([]);
  const [particles, setParticles] = useState<ParticleData[]>([]);
  const [showHint, setShowHint] = useState(true);
  const effectIdRef = useRef(0);

  const getRandomColor = useCallback(() => {
    return Colors.particleColors[
      Math.floor(Math.random() * Colors.particleColors.length)
    ];
  }, []);

  const createParticles = useCallback(
    (x: number, y: number): ParticleData[] => {
      const newParticles: ParticleData[] = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const angle = (Math.PI * 2 * i) / PARTICLE_COUNT + (Math.random() - 0.5) * 0.5;
        newParticles.push({
          id: `p_${effectIdRef.current}_${i}`,
          x,
          y,
          angle,
          distance: 40 + Math.random() * 80,
          size: 4 + Math.random() * 10,
          color: getRandomColor(),
          delay: Math.random() * 100,
        });
      }
      return newParticles;
    },
    [getRandomColor]
  );

  const handleTap = useCallback(
    (evt: any) => {
      const x = evt.nativeEvent.locationX;
      const y = evt.nativeEvent.locationY;
      const color = getRandomColor();
      const id = `effect_${effectIdRef.current++}`;

      if (showHint) setShowHint(false);

      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      const newEffect: TapEffect = { id, x, y, color, timestamp: Date.now() };
      const newParticles = createParticles(x, y);

      setEffects((prev) => [...prev.slice(-15), newEffect]);
      setParticles((prev) => [...prev.slice(-50), ...newParticles]);
      setTapCount((prev) => prev + 1);

      const effectNum = effectIdRef.current - 1;
      setTimeout(() => {
        setEffects((prev) => prev.filter((e) => e.id !== id));
        setParticles((prev) =>
          prev.filter((p) => !p.id.startsWith(`p_${effectNum}_`))
        );
      }, 1200);
    },
    [getRandomColor, createParticles, showHint]
  );

  const handleReset = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setTapCount(0);
    setEffects([]);
    setParticles([]);
    setShowHint(true);
  }, []);

  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={styles.container}>
      <View style={styles.bgPattern}>
        {Array.from({ length: 6 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.bgCircle,
              {
                left: ((i * 37) % 100) + "%",
                top: ((i * 53 + 20) % 100) + "%",
                width: 200 + i * 40,
                height: 200 + i * 40,
                borderRadius: 100 + i * 20,
                opacity: 0.015 + i * 0.005,
              },
            ]}
          />
        ))}
      </View>

      <Pressable style={styles.tapArea} onPress={handleTap}>
        {effects.map((effect) => (
          <React.Fragment key={effect.id}>
            <GlowDot x={effect.x} y={effect.y} color={effect.color} />
            {Array.from({ length: RIPPLE_COUNT }).map((_, i) => (
              <Ripple
                key={`${effect.id}_ripple_${i}`}
                x={effect.x}
                y={effect.y}
                color={effect.color}
                delay={i * 80}
              />
            ))}
            <FlashOverlay color={effect.color} />
          </React.Fragment>
        ))}

        {particles.map((p) => (
          <Particle key={p.id} data={p} />
        ))}
      </Pressable>

      <CounterDisplay count={tapCount} />
      <ResetButton onReset={handleReset} />
      <HintText visible={showHint} />

      {tapCount > 0 && (
        <View style={[styles.bottomInfo, { paddingBottom: bottomPadding + 16 }]}>
          <Text style={styles.motivationText}>
            {tapCount < 10
              ? "Keep going..."
              : tapCount < 50
                ? "Feel the release"
                : tapCount < 100
                  ? "Unstoppable"
                  : tapCount < 500
                    ? "Pure energy"
                    : "Legendary"}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  bgPattern: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  bgCircle: {
    position: "absolute",
    backgroundColor: Colors.accent,
  },
  tapArea: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  counterContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    pointerEvents: "none" as const,
  },
  counterInner: {
    alignItems: "center",
  },
  counterNumber: {
    fontSize: 48,
    fontFamily: "SpaceGrotesk_700Bold",
    color: "#fff",
    letterSpacing: -2,
  },
  counterLabel: {
    fontSize: 11,
    fontFamily: "SpaceGrotesk_400Regular",
    color: "rgba(255,255,255,0.3)",
    letterSpacing: 4,
    marginTop: -4,
  },
  resetButton: {
    position: "absolute",
    right: 20,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  hintContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  hintText: {
    fontSize: 14,
    fontFamily: "SpaceGrotesk_400Regular",
    color: "rgba(255,255,255,0.2)",
    letterSpacing: 6,
    marginBottom: 20,
  },
  hintPulse: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    pointerEvents: "none" as const,
  },
  motivationText: {
    fontSize: 13,
    fontFamily: "SpaceGrotesk_400Regular",
    color: "rgba(255,255,255,0.25)",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
});
