import { useState } from "react";
import { Share, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import type { GroupDetail } from "@bounty/shared";
import { colors, fonts, radii, spacing } from "@/constants/theme";
import { PrimaryButton } from "@/components/PrimaryButton";
import { InviteQr } from "@/components/InviteQr";
import { useAppState } from "@/context/AppState";

export default function CreateGroupScreen() {
  const { createNewGroup, activateGroup } = useAppState();
  const router = useRouter();
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdGroup, setCreatedGroup] = useState<GroupDetail | null>(null);
  const [entering, setEntering] = useState(false);

  const canSubmit = name.trim().length >= 2 && !submitting;

  async function handleCreate() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const detail = await createNewGroup(name.trim());
      setCreatedGroup(detail);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el grupo");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEnter() {
    if (!createdGroup) return;
    setEntering(true);
    await activateGroup(createdGroup);
    router.replace("/(tabs)");
  }

  if (createdGroup) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.content}>
          <Text style={styles.eyebrow}>GRUPO CREADO</Text>
          <Text style={styles.title}>{createdGroup.name}</Text>
          <Text style={styles.subtitle}>
            Comparte este código o el QR con tus amigos para que se unan.
          </Text>

          <View style={styles.qrWrap}>
            <InviteQr code={createdGroup.code} />
          </View>

          <Text style={styles.code}>{createdGroup.code}</Text>

          <View style={styles.footer}>
            <PrimaryButton
              label="Compartir código"
              variant="secondary"
              onPress={() =>
                Share.share({
                  message: `Únete a mi grupo "${createdGroup.name}" en Bounty con el código ${createdGroup.code}`,
                })
              }
            />
            <View style={{ height: spacing.sm }} />
            <PrimaryButton label="Entrar al grupo" onPress={handleEnter} loading={entering} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>NUEVO GRUPO</Text>
        <Text style={styles.title}>¿Cómo se llama la panda?</Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Ej. Los del barrio"
          placeholderTextColor={colors.textFaint}
          maxLength={40}
          style={styles.input}
          autoCapitalize="sentences"
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.footer}>
          <PrimaryButton
            label={submitting ? "Creando..." : "Crear grupo"}
            onPress={handleCreate}
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
    alignItems: "stretch",
  },
  eyebrow: {
    fontFamily: fonts.mono,
    fontSize: 12,
    letterSpacing: 2,
    color: colors.accent,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  subtitle: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textDim,
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  input: {
    fontFamily: fonts.mono,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  error: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.danger,
    marginTop: spacing.sm,
  },
  qrWrap: {
    alignSelf: "center",
    marginVertical: spacing.lg,
  },
  code: {
    fontFamily: fonts.monoBold,
    fontSize: 32,
    letterSpacing: 6,
    color: colors.textPrimary,
    textAlign: "center",
  },
  footer: {
    marginTop: "auto",
    paddingBottom: spacing.lg,
  },
});
