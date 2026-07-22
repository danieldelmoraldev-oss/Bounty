import { useCallback, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { colors, fonts, radii, spacing } from "@/constants/theme";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAppState } from "@/context/AppState";

export default function JoinGroupScreen() {
  const { joinExistingGroup } = useAppState();
  const router = useRouter();
  const params = useLocalSearchParams<{ code?: string }>();
  const [code, setCode] = useState(params.code?.toUpperCase() ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (params.code) {
        setCode(params.code.toUpperCase());
      }
    }, [params.code]),
  );

  const canSubmit = code.trim().length === 5 && !submitting;

  async function handleJoin(value: string) {
    if (value.trim().length !== 5 || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await joinExistingGroup(value.trim());
      router.replace("/(tabs)");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo unir al grupo");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>UNIRSE A UN GRUPO</Text>
        <Text style={styles.title}>Escribe el código</Text>
        <Text style={styles.subtitle}>Son 5 letras. Te lo pasa quien te invita.</Text>

        <TextInput
          value={code}
          onChangeText={(text) => setCode(text.toUpperCase().slice(0, 5))}
          placeholder="XXXXX"
          placeholderTextColor={colors.textFaint}
          maxLength={5}
          autoCapitalize="characters"
          autoCorrect={false}
          style={styles.codeInput}
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.footer}>
          <PrimaryButton
            label="Escanear QR en su lugar"
            variant="secondary"
            onPress={() => router.push("/onboarding/scan")}
          />
          <View style={{ height: spacing.sm }} />
          <PrimaryButton
            label={submitting ? "Uniéndome..." : "Unirme"}
            onPress={() => handleJoin(code)}
            disabled={!canSubmit}
            loading={submitting}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    gap: spacing.sm,
  },
  eyebrow: {
    fontFamily: fonts.mono,
    fontSize: 12,
    letterSpacing: 2,
    color: colors.tertiary,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  subtitle: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textDim,
    marginBottom: spacing.lg,
  },
  codeInput: {
    fontFamily: fonts.monoBold,
    fontSize: 36,
    letterSpacing: 10,
    textAlign: "center",
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: spacing.lg,
  },
  error: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.danger,
    marginTop: spacing.sm,
  },
  footer: {
    marginTop: "auto",
    paddingBottom: spacing.lg,
  },
});
