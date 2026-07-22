import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, useRouter } from "expo-router";
import { AVATAR_COLORS, AVATAR_EMOJIS } from "@/constants/avatars";
import { colors, fonts, radii, spacing } from "@/constants/theme";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAppState } from "@/context/AppState";

export default function ProfileSetupScreen() {
  const { status, completeProfile } = useAppState();
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [avatarEmoji, setAvatarEmoji] = useState(AVATAR_EMOJIS[0]!);
  const [avatarColor, setAvatarColor] = useState<string>(AVATAR_COLORS[0]!);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === "needs-group") {
    return <Redirect href="/onboarding/start" />;
  }

  const canSubmit = displayName.trim().length >= 2 && !submitting;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await completeProfile({ displayName: displayName.trim(), avatarEmoji, avatarColor });
      router.replace("/onboarding/start");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo ha ido mal");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>BOUNTY</Text>
        <Text style={styles.title}>¿Cómo te llamamos?</Text>
        <Text style={styles.subtitle}>
          Sin email ni contraseña. Solo un nombre y un avatar para que te
          reconozca tu grupo.
        </Text>

        <View style={[styles.avatarPreview, { backgroundColor: avatarColor }]}>
          <Text style={styles.avatarPreviewEmoji}>{avatarEmoji}</Text>
        </View>

        <TextInput
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Tu nombre"
          placeholderTextColor={colors.textFaint}
          maxLength={24}
          style={styles.input}
          autoCapitalize="words"
          autoCorrect={false}
        />

        <Text style={styles.sectionLabel}>AVATAR</Text>
        <View style={styles.emojiGrid}>
          {AVATAR_EMOJIS.map((emoji) => (
            <Pressable
              key={emoji}
              onPress={() => setAvatarEmoji(emoji)}
              style={[
                styles.emojiCell,
                emoji === avatarEmoji && styles.emojiCellSelected,
              ]}
            >
              <Text style={styles.emojiText}>{emoji}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionLabel}>COLOR</Text>
        <View style={styles.colorRow}>
          {AVATAR_COLORS.map((color) => (
            <Pressable
              key={color}
              onPress={() => setAvatarColor(color)}
              style={[
                styles.colorDot,
                { backgroundColor: color },
                color === avatarColor && styles.colorDotSelected,
              ]}
            />
          ))}
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.footer}>
          <PrimaryButton
            label={submitting ? "Creando..." : "Continuar"}
            onPress={handleSubmit}
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
    paddingTop: spacing.xl,
    gap: spacing.sm,
  },
  eyebrow: {
    fontFamily: fonts.mono,
    fontSize: 12,
    letterSpacing: 2,
    color: colors.accent,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  subtitle: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textDim,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  avatarPreview: {
    width: 88,
    height: 88,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: spacing.md,
  },
  avatarPreviewEmoji: {
    fontSize: 40,
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
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.textFaint,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  emojiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  emojiCell: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  emojiCellSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.surfaceElevated,
  },
  emojiText: {
    fontSize: 22,
  },
  colorRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  colorDot: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorDotSelected: {
    borderColor: colors.textPrimary,
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
