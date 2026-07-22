import { useCallback, useState } from "react";
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import type { Season, SeasonLeaderboard } from "@bounty/shared";
import * as api from "@/lib/api";
import { colors, fonts, radii, spacing } from "@/constants/theme";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAppState } from "@/context/AppState";

export default function RanksScreen() {
  const { user, group } = useAppState();
  const [leaderboard, setLeaderboard] = useState<SeasonLeaderboard | null>(null);
  const [history, setHistory] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);

  const isAdmin = group?.members.find((m) => m.userId === user?.id)?.role === "admin";

  const load = useCallback(async () => {
    if (!group) return;
    const [active, seasons] = await Promise.all([
      api.fetchActiveSeason(group.id),
      api.fetchSeasonHistory(group.id),
    ]);
    setLeaderboard(active);
    setHistory(seasons);
  }, [group]);

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

  async function handleStartSeason() {
    if (!group) return;
    setBusy(true);
    try {
      await api.startSeason(group.id);
      await load();
    } catch (err) {
      Alert.alert("No se pudo empezar la temporada", err instanceof Error ? err.message : "");
    } finally {
      setBusy(false);
    }
  }

  function confirmEndSeason() {
    if (!group || !leaderboard) return;
    Alert.alert(
      "Terminar temporada",
      `Se cerrará "${leaderboard.season.name}" con el ranking actual. No se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Terminar",
          style: "destructive",
          onPress: async () => {
            setBusy(true);
            try {
              await api.endSeason(group.id, leaderboard.season.id);
              await load();
            } catch (err) {
              Alert.alert("No se pudo terminar la temporada", err instanceof Error ? err.message : "");
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );
  }

  if (!group) return null;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      >
        <View style={styles.header}>
          <Ionicons name="stats-chart-outline" size={28} color={colors.gold} />
          <View>
            <Text style={styles.title}>La Liga</Text>
            <Text style={styles.subtitle}>{group.name}</Text>
          </View>
        </View>

        {loading ? null : leaderboard ? (
          <>
            <View style={styles.seasonBanner}>
              <Text style={styles.seasonName}>{leaderboard.season.name}</Text>
              <Text style={styles.seasonMeta}>TEMPORADA ACTIVA</Text>
            </View>

            <View style={styles.card}>
              {leaderboard.entries.map((entry) => (
                <View
                  key={entry.userId}
                  style={[
                    styles.entryRow,
                    entry.isLeader && styles.entryRowLeader,
                    entry.isLoser && styles.entryRowLoser,
                  ]}
                >
                  <Text
                    style={[
                      styles.rank,
                      entry.isLeader && { color: colors.gold },
                      entry.isLoser && { color: colors.danger },
                    ]}
                  >
                    #{entry.rank}
                  </Text>
                  <View style={[styles.avatar, { backgroundColor: entry.avatarColor }]}>
                    <Text style={styles.avatarEmoji}>{entry.avatarEmoji}</Text>
                  </View>
                  <Text style={styles.entryName}>{entry.displayName}</Text>
                  {entry.isLeader && <Ionicons name="trophy" size={16} color={colors.gold} />}
                  {entry.isLoser && <Ionicons name="skull-outline" size={16} color={colors.danger} />}
                  <Text style={styles.points}>{entry.points} pts</Text>
                </View>
              ))}
            </View>

            {isAdmin && (
              <View style={styles.actionWrap}>
                <PrimaryButton
                  label={busy ? "..." : "Terminar temporada"}
                  variant="danger"
                  onPress={confirmEndSeason}
                  loading={busy}
                />
              </View>
            )}
          </>
        ) : (
          <View style={styles.card}>
            <Text style={styles.emptyText}>
              No hay ninguna temporada activa. {isAdmin ? "Empieza una para que el grupo compita." : "Pídele al admin que empiece una."}
            </Text>
            {isAdmin && (
              <View style={styles.actionWrap}>
                <PrimaryButton
                  label={busy ? "Creando..." : "Empezar temporada"}
                  onPress={handleStartSeason}
                  loading={busy}
                />
              </View>
            )}
          </View>
        )}

        {(() => {
          const endedSeasons = history.filter((s) => s.status === "ended");
          if (endedSeasons.length === 0) return null;
          return (
            <>
              <Text style={styles.sectionTitle}>TEMPORADAS ANTERIORES</Text>
              <View style={styles.card}>
                {endedSeasons.map((season) => (
                  <View key={season.id} style={styles.historyRow}>
                    <Text style={styles.historyName}>{season.name}</Text>
                    <Text style={styles.historyDate}>
                      {new Date(season.startedAt).toLocaleDateString()} –{" "}
                      {season.endedAt ? new Date(season.endedAt).toLocaleDateString() : ""}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          );
        })()}
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
  seasonBanner: {
    alignItems: "center",
    gap: 2,
  },
  seasonName: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  seasonMeta: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.accent,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  entryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    paddingHorizontal: spacing.xs,
  },
  entryRowLeader: {
    backgroundColor: "rgba(255,214,92,0.08)",
  },
  entryRowLoser: {
    backgroundColor: "rgba(255,77,77,0.08)",
  },
  rank: {
    fontFamily: fonts.monoBold,
    fontSize: 14,
    color: colors.textDim,
    width: 28,
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
  entryName: {
    flex: 1,
    fontFamily: fonts.mono,
    fontSize: 14,
    color: colors.textPrimary,
  },
  points: {
    fontFamily: fonts.monoBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  actionWrap: {
    marginTop: spacing.sm,
  },
  emptyText: {
    fontFamily: fonts.mono,
    fontSize: 13,
    color: colors.textDim,
    lineHeight: 19,
  },
  sectionTitle: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.textFaint,
    marginTop: spacing.sm,
  },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
  },
  historyName: {
    fontFamily: fonts.mono,
    fontSize: 13,
    color: colors.textPrimary,
  },
  historyDate: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textFaint,
  },
});
