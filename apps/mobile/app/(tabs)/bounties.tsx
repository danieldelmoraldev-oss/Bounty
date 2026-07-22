import { useCallback, useState } from "react";
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import type { ChallengeCard as ChallengeCardType, PartyState } from "@bounty/shared";
import * as api from "@/lib/api";
import { colors, fonts, radii, spacing } from "@/constants/theme";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAppState } from "@/context/AppState";

const DIFFICULTY_COLOR: Record<number, string> = {
  1: colors.tertiary,
  2: colors.tertiary,
  3: colors.secondary,
  4: colors.danger,
  5: colors.danger,
};

const STATUS_LABEL: Record<ChallengeCardType["status"], string> = {
  locked: "BLOQUEADO",
  available: "DISPONIBLE",
  submitted: "EN REVISIÓN",
  approved: "APROBADO",
  rejected: "NO CONTÓ",
};

export default function BountiesScreen() {
  const { user, group } = useAppState();
  const router = useRouter();
  const [partyState, setPartyState] = useState<PartyState | null>(null);
  const [pendingReviews, setPendingReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);

  const isAdmin = group?.members.find((m) => m.userId === user?.id)?.role === "admin";

  const load = useCallback(async () => {
    if (!group) return;
    const active = await api.fetchActiveParty(group.id);
    setPartyState(active);
    if (isAdmin && active) {
      const queue = await api.fetchReviewQueue(group.id, active.party.id);
      setPendingReviews(queue.length);
    } else {
      setPendingReviews(0);
    }
  }, [group, isAdmin]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [load]),
  );

  async function onRefresh() {
    setRefreshing(true);
    await load().catch(() => null);
    setRefreshing(false);
  }

  async function handleStartParty() {
    if (!group) return;
    setBusy(true);
    try {
      await api.startParty(group.id);
      await load();
    } catch (err) {
      Alert.alert("No se pudo empezar la noche", err instanceof Error ? err.message : "");
    } finally {
      setBusy(false);
    }
  }

  function confirmEndParty() {
    if (!group || !partyState) return;
    Alert.alert("Terminar la noche", "Se cerrará el envío de nuevas pruebas. Podrás revisar lo pendiente después.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Terminar",
        style: "destructive",
        onPress: async () => {
          setBusy(true);
          try {
            await api.endParty(group.id, partyState.party.id);
            await load();
          } catch (err) {
            Alert.alert("No se pudo terminar la noche", err instanceof Error ? err.message : "");
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  }

  function confirmReroll(card: ChallengeCardType) {
    if (!group || !partyState) return;
    Alert.alert(
      "Re-rollear reto",
      `Cuesta ${card.points} puntos y te dará otro reto de nivel ${card.difficulty}. ¿Seguro?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Re-rollear",
          onPress: async () => {
            try {
              await api.rerollChallenge(group.id, partyState.party.id, card.id);
              await load();
            } catch (err) {
              Alert.alert("No se pudo re-rollear", err instanceof Error ? err.message : "");
            }
          },
        },
      ],
    );
  }

  function openChallenge(card: ChallengeCardType) {
    if (!group || !partyState || card.status !== "available") return;
    router.push({
      pathname: "/bounties/submit",
      params: {
        groupId: group.id,
        partyId: partyState.party.id,
        assignmentId: card.id,
        prompt: card.prompt,
        difficulty: String(card.difficulty),
        points: String(card.points),
      },
    });
  }

  if (!group) return null;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      >
        <View style={styles.header}>
          <Ionicons name="flag-outline" size={28} color={colors.accent} />
          <View>
            <Text style={styles.title}>Bounties</Text>
            <Text style={styles.subtitle}>{group.name}</Text>
          </View>
        </View>

        {loading ? null : partyState ? (
          <>
            {isAdmin && pendingReviews > 0 && (
              <PrimaryButton
                label={`Revisar ${pendingReviews} envío${pendingReviews > 1 ? "s" : ""}`}
                onPress={() =>
                  router.push({
                    pathname: "/bounties/review",
                    params: { groupId: group.id, partyId: partyState.party.id },
                  })
                }
              />
            )}

            <View style={{ gap: spacing.sm }}>
              {partyState.challenges.map((card) => (
                <View
                  key={card.id}
                  style={[styles.card, card.status === "locked" && styles.cardLocked]}
                >
                  <View style={styles.cardHeader}>
                    <View
                      style={[
                        styles.difficultyBadge,
                        { borderColor: DIFFICULTY_COLOR[card.difficulty] },
                      ]}
                    >
                      <Text style={[styles.difficultyText, { color: DIFFICULTY_COLOR[card.difficulty] }]}>
                        NIVEL {card.difficulty}
                      </Text>
                    </View>
                    <Text style={styles.statusText}>{STATUS_LABEL[card.status]}</Text>
                  </View>

                  {card.status === "locked" ? (
                    <View style={styles.lockedRow}>
                      <Ionicons name="lock-closed-outline" size={16} color={colors.textFaint} />
                      <Text style={styles.lockedText}>Completa el nivel 1 para desbloquear</Text>
                    </View>
                  ) : (
                    <Text style={styles.prompt}>{card.prompt}</Text>
                  )}

                  <View style={styles.cardFooter}>
                    <Text style={styles.pointsText}>{card.points} pts</Text>
                    {card.status === "available" && (
                      <View style={{ flexDirection: "row", gap: spacing.sm }}>
                        <PrimaryButton
                          label="Re-roll"
                          variant="secondary"
                          onPress={() => confirmReroll(card)}
                        />
                        <PrimaryButton label="Hacer reto" onPress={() => openChallenge(card)} />
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>

            {isAdmin && (
              <View style={styles.actionWrap}>
                <PrimaryButton
                  label={busy ? "..." : "Terminar la noche"}
                  variant="danger"
                  onPress={confirmEndParty}
                  loading={busy}
                />
              </View>
            )}
          </>
        ) : (
          <View style={styles.card}>
            <Text style={styles.emptyText}>
              {isAdmin
                ? "Todavía no ha empezado la noche. En cuanto la abras, todos reciben sus retos."
                : "Esperando a que el admin empiece la noche."}
            </Text>
            {isAdmin && (
              <View style={styles.actionWrap}>
                <PrimaryButton
                  label={busy ? "Abriendo..." : "Empezar la Noche"}
                  onPress={handleStartParty}
                  loading={busy}
                />
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textDim,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardLocked: {
    opacity: 0.5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  statusText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 0.5,
    color: colors.textFaint,
  },
  prompt: {
    fontFamily: fonts.mono,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  lockedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  lockedText: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textFaint,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  pointsText: {
    fontFamily: fonts.monoBold,
    fontSize: 13,
    color: colors.textDim,
  },
  emptyText: {
    fontFamily: fonts.mono,
    fontSize: 13,
    color: colors.textDim,
    lineHeight: 19,
  },
  actionWrap: {
    marginTop: spacing.sm,
  },
});
