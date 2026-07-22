import { useCallback, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import type { AlbumItem } from "@bounty/shared";
import * as api from "@/lib/api";
import { colors, fonts, radii, spacing } from "@/constants/theme";
import { PrimaryButton } from "@/components/PrimaryButton";
import { StarRating } from "@/components/StarRating";
import { useAppState } from "@/context/AppState";

const DIFFICULTY_COLOR: Record<number, string> = {
  1: colors.tertiary,
  2: colors.tertiary,
  3: colors.secondary,
  4: colors.danger,
  5: colors.danger,
};

export default function AlbumPartyScreen() {
  const { group } = useAppState();
  const router = useRouter();
  const params = useLocalSearchParams<{ partyId: string }>();
  const [items, setItems] = useState<AlbumItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!group) return;
    const detail = await api.fetchAlbumDetail(group.id, params.partyId);
    setItems(detail);
  }, [group, params.partyId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [load]),
  );

  async function handleRate(postId: string, stars: number) {
    if (!group) return;
    await api.rateFreestyle(group.id, postId, stars);
    await load();
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Fiesta</Text>
        <PrimaryButton label="Cerrar" variant="secondary" onPress={() => router.back()} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {!loading && items.length === 0 && (
          <Text style={styles.emptyText}>No hay fotos en esta fiesta todavía.</Text>
        )}

        {items.map((item) => (
          <View key={`${item.kind}-${item.id}`} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.avatar, { backgroundColor: item.author.avatarColor }]}>
                <Text style={styles.avatarEmoji}>{item.author.avatarEmoji}</Text>
              </View>
              <Text style={styles.authorName}>{item.author.displayName}</Text>
              {item.kind === "challenge" && (
                <View
                  style={[styles.difficultyBadge, { borderColor: DIFFICULTY_COLOR[item.difficulty] }]}
                >
                  <Text style={[styles.difficultyText, { color: DIFFICULTY_COLOR[item.difficulty] }]}>
                    NIVEL {item.difficulty}
                  </Text>
                </View>
              )}
            </View>

            <Image source={{ uri: item.photoUrl }} style={styles.photo} resizeMode="cover" />

            {item.kind === "challenge" ? (
              <Text style={styles.caption}>{item.prompt}</Text>
            ) : (
              <>
                {item.caption && <Text style={styles.caption}>{item.caption}</Text>}
                <StarRating
                  average={item.averageStars}
                  count={item.ratingCount}
                  myStars={item.myStars}
                  onRate={(stars) => handleRate(item.id, stars)}
                />
              </>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.textPrimary,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  emptyText: {
    fontFamily: fonts.mono,
    fontSize: 13,
    color: colors.textDim,
    textAlign: "center",
    marginTop: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEmoji: {
    fontSize: 14,
  },
  authorName: {
    flex: 1,
    fontFamily: fonts.mono,
    fontSize: 13,
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
  photo: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceElevated,
  },
  caption: {
    fontFamily: fonts.mono,
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 19,
  },
});
