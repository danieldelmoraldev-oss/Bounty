import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors, fonts, radii, spacing } from "@/constants/theme";
import { useAppState } from "@/context/AppState";

export default function StartScreen() {
  const { user } = useAppState();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>
          {user ? `HOLA, ${user.displayName.toUpperCase()}` : "BOUNTY"}
        </Text>
        <Text style={styles.title}>¿Qué quieres hacer?</Text>

        <Pressable
          style={styles.card}
          onPress={() => router.push("/onboarding/create")}
        >
          <Ionicons name="add-circle-outline" size={32} color={colors.accent} />
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Crear un grupo</Text>
            <Text style={styles.cardDescription}>
              Serás el admin. Te damos un código de 5 letras y un QR para
              invitar a tus amigos.
            </Text>
          </View>
        </Pressable>

        <Pressable
          style={styles.card}
          onPress={() => router.push("/onboarding/join")}
        >
          <Ionicons name="enter-outline" size={32} color={colors.tertiary} />
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Unirme a un grupo</Text>
            <Text style={styles.cardDescription}>
              Escanea el QR de un amigo o escribe el código que te ha pasado.
            </Text>
          </View>
        </Pressable>
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
    gap: spacing.md,
  },
  eyebrow: {
    fontFamily: fonts.mono,
    fontSize: 12,
    letterSpacing: 2,
    color: colors.accent,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  card: {
    flexDirection: "row",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    alignItems: "flex-start",
  },
  cardText: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 17,
    color: colors.textPrimary,
  },
  cardDescription: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textDim,
    lineHeight: 17,
  },
});
