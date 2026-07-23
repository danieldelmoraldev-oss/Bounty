import { useEffect, useRef, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { RecapSlide } from "@bounty/shared";
import * as api from "@/lib/api";
import { colors, fonts, radii, spacing } from "@/constants/theme";
import { useAppState } from "@/context/AppState";

const SLIDE_DURATION_MS = 4500;
const MEDALS = ["🥇", "🥈", "🥉"];

const DIFFICULTY_COLOR: Record<number, string> = {
  1: colors.tertiary,
  2: colors.tertiary,
  3: colors.secondary,
  4: colors.danger,
  5: colors.danger,
};

export default function RecapScreen() {
  const router = useRouter();
  const { group } = useAppState();
  const params = useLocalSearchParams<{ partyId: string }>();
  const [slides, setSlides] = useState<RecapSlide[] | null>(null);
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!group) return;
    api.fetchRecap(group.id, params.partyId).then(setSlides);
  }, [group, params.partyId]);

  useEffect(() => {
    if (!slides) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => advance(1), SLIDE_DURATION_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [slides, index]);

  function advance(delta: number) {
    setIndex((current) => {
      const next = current + delta;
      if (!slides || next < 0) return 0;
      if (next >= slides.length) {
        router.back();
        return current;
      }
      return next;
    });
  }

  if (!slides || slides.length === 0) {
    return <View style={styles.container} />;
  }

  const slide = slides[index]!;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.overlay} edges={["top"]}>
        <View style={styles.progressRow}>
          {slides.map((_, i) => (
            <View key={i} style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: i < index ? "100%" : i === index ? "50%" : "0%" },
                ]}
              />
            </View>
          ))}
        </View>
        <Pressable style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close" size={22} color={colors.textPrimary} />
        </Pressable>
      </SafeAreaView>

      {slide.kind === "stats" ? (
        <View style={styles.statsSlide}>
          <Ionicons name="trophy" size={40} color={colors.gold} />
          <Text style={styles.statsTitle}>Los mejores de la noche</Text>
          <View style={{ gap: spacing.sm, marginTop: spacing.lg, width: "100%" }}>
            {slide.topEntries.length === 0 ? (
              <Text style={styles.statsEmpty}>Nadie ganó puntos esta noche. Habrá revancha.</Text>
            ) : (
              slide.topEntries.map((entry, i) => (
                <View key={i} style={styles.statsRow}>
                  <Text style={styles.medal}>{MEDALS[i] ?? "•"}</Text>
                  <View style={[styles.avatar, { backgroundColor: entry.avatarColor }]}>
                    <Text style={styles.avatarEmoji}>{entry.avatarEmoji}</Text>
                  </View>
                  <Text style={styles.statsName}>{entry.displayName}</Text>
                  <Text style={styles.statsPoints}>{entry.points} pts</Text>
                </View>
              ))
            )}
          </View>
          <Text style={styles.statsFooter}>
            {slide.totalChallenges} retos completados · {slide.totalFreestyle} fotos libres
          </Text>
        </View>
      ) : (
        <View style={styles.photoSlide}>
          <Image source={{ uri: slide.photoUrl }} style={styles.photo} resizeMode="cover" />
          <View style={styles.authorRow}>
            <View style={[styles.avatar, { backgroundColor: slide.author.avatarColor }]}>
              <Text style={styles.avatarEmoji}>{slide.author.avatarEmoji}</Text>
            </View>
            <Text style={styles.authorName}>{slide.author.displayName}</Text>
            {slide.kind === "challenge" && (
              <View
                style={[styles.difficultyBadge, { borderColor: DIFFICULTY_COLOR[slide.difficulty] }]}
              >
                <Text style={[styles.difficultyText, { color: DIFFICULTY_COLOR[slide.difficulty] }]}>
                  NIVEL {slide.difficulty}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.caption}>
            {slide.kind === "challenge" ? slide.prompt : slide.caption ?? ""}
          </Text>
          {slide.kind === "freestyle" && slide.averageStars !== null && (
            <Text style={styles.rating}>
              ⭐ {slide.averageStars.toFixed(1)} ({slide.ratingCount})
            </Text>
          )}
        </View>
      )}

      <View style={styles.tapZones} pointerEvents="box-none">
        <Pressable style={styles.tapLeft} onPress={() => advance(-1)} />
        <Pressable style={styles.tapRight} onPress={() => advance(1)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  progressRow: {
    flexDirection: "row",
    gap: 4,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.accent,
  },
  closeButton: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.md,
    padding: spacing.xs,
  },
  tapZones: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
  },
  tapLeft: {
    flex: 3,
  },
  tapRight: {
    flex: 7,
  },
  photoSlide: {
    flex: 1,
  },
  photo: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
  },
  authorRow: {
    position: "absolute",
    bottom: 90,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEmoji: {
    fontSize: 16,
  },
  authorName: {
    flex: 1,
    fontFamily: fonts.monoBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  difficultyBadge: {
    borderWidth: 1,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  difficultyText: {
    fontFamily: fonts.monoBold,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  caption: {
    position: "absolute",
    bottom: 50,
    left: spacing.lg,
    right: spacing.lg,
    fontFamily: fonts.mono,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  rating: {
    position: "absolute",
    bottom: 24,
    left: spacing.lg,
    fontFamily: fonts.monoBold,
    fontSize: 13,
    color: colors.gold,
  },
  statsSlide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  statsTitle: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.textPrimary,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  statsEmpty: {
    fontFamily: fonts.mono,
    fontSize: 13,
    color: colors.textDim,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.sm,
  },
  medal: {
    fontSize: 20,
  },
  statsName: {
    flex: 1,
    fontFamily: fonts.mono,
    fontSize: 14,
    color: colors.textPrimary,
  },
  statsPoints: {
    fontFamily: fonts.monoBold,
    fontSize: 14,
    color: colors.gold,
  },
  statsFooter: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textFaint,
    marginTop: spacing.xl,
    textAlign: "center",
  },
});
