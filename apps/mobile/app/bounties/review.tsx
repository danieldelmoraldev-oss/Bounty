import { useCallback, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import type { ReviewQueueItem } from "@bounty/shared";
import * as api from "@/lib/api";
import { colors, fonts, radii, spacing } from "@/constants/theme";
import { PrimaryButton } from "@/components/PrimaryButton";

export default function ReviewQueueScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ groupId: string; partyId: string }>();
  const [items, setItems] = useState<ReviewQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [decidingId, setDecidingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const queue = await api.fetchReviewQueue(params.groupId, params.partyId);
    setItems(queue);
  }, [params.groupId, params.partyId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [load]),
  );

  async function decide(item: ReviewQueueItem, approve: boolean) {
    setDecidingId(item.id);
    try {
      await api.reviewChallenge(params.groupId, params.partyId, item.id, approve);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } finally {
      setDecidingId(null);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Revisar envíos</Text>
        <PrimaryButton label="Cerrar" variant="secondary" onPress={() => router.back()} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {!loading && items.length === 0 && (
          <Text style={styles.emptyText}>No queda nada por revisar. Todo al día.</Text>
        )}

        {items.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.avatar, { backgroundColor: item.avatarColor }]}>
                <Text style={styles.avatarEmoji}>{item.avatarEmoji}</Text>
              </View>
              <Text style={styles.userName}>{item.displayName}</Text>
              <Text style={styles.difficultyText}>NIVEL {item.difficulty}</Text>
            </View>

            <Text style={styles.prompt}>{item.prompt}</Text>

            {item.photoDataUrl && (
              <Image source={{ uri: item.photoDataUrl }} style={styles.photo} resizeMode="cover" />
            )}

            <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm }}>
              <PrimaryButton
                label="Rechazar"
                variant="danger"
                onPress={() => decide(item, false)}
                loading={decidingId === item.id}
                style={{ flex: 1 }}
              />
              <PrimaryButton
                label="Aprobar"
                onPress={() => decide(item, true)}
                loading={decidingId === item.id}
                style={{ flex: 1 }}
              />
            </View>
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
  userName: {
    flex: 1,
    fontFamily: fonts.mono,
    fontSize: 13,
    color: colors.textPrimary,
  },
  difficultyText: {
    fontFamily: fonts.monoBold,
    fontSize: 10,
    letterSpacing: 0.5,
    color: colors.textFaint,
  },
  prompt: {
    fontFamily: fonts.mono,
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 19,
  },
  photo: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceElevated,
  },
});
