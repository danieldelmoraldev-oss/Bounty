import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { HealthResponse } from "@bounty/shared";
import { getHealth } from "@/lib/api";
import { colors, fonts, radii, spacing } from "@/constants/theme";

type Status =
  | { kind: "loading" }
  | { kind: "ok"; health: HealthResponse }
  | { kind: "error"; message: string };

export default function RanksScreen() {
  const [status, setStatus] = useState<Status>({ kind: "loading" });

  useEffect(() => {
    getHealth()
      .then((health) => setStatus({ kind: "ok", health }))
      .catch((err) =>
        setStatus({
          kind: "error",
          message: err instanceof Error ? err.message : "Error desconocido",
        }),
      );
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.content}>
        <Ionicons name="stats-chart-outline" size={40} color={colors.gold} />
        <Text style={styles.title}>La Liga</Text>
        <Text style={styles.subtitle}>
          El ranking de la temporada llega en la Fase 1-2. Este chip valida
          que la app ya habla con el servidor real.
        </Text>
        <StatusChip status={status} />
      </View>
    </SafeAreaView>
  );
}

function StatusChip({ status }: { status: Status }) {
  if (status.kind === "loading") {
    return (
      <View style={styles.chip}>
        <ActivityIndicator color={colors.textDim} size="small" />
        <Text style={styles.chipText}>CONECTANDO...</Text>
      </View>
    );
  }

  if (status.kind === "error") {
    return (
      <View style={[styles.chip, { borderColor: colors.danger }]}>
        <View style={[styles.dot, { backgroundColor: colors.danger }]} />
        <Text style={[styles.chipText, { color: colors.danger }]}>
          API OFFLINE — {status.message}
        </Text>
      </View>
    );
  }

  const ok = status.health.status === "ok";
  return (
    <View
      style={[styles.chip, { borderColor: ok ? colors.accent : colors.danger }]}
    >
      <View
        style={[styles.dot, { backgroundColor: ok ? colors.accent : colors.danger }]}
      />
      <Text
        style={[styles.chipText, { color: ok ? colors.accent : colors.danger }]}
      >
        {status.health.status.toUpperCase()} · DB {status.health.db.toUpperCase()} ·
        MODE {status.health.dataMode.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fonts.mono,
    fontSize: 13,
    color: colors.textDim,
    textAlign: "center",
    lineHeight: 20,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chipText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textDim,
    letterSpacing: 0.5,
  },
});
