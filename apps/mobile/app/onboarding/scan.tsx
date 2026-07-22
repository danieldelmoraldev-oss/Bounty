import { useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { colors, fonts, radii, spacing } from "@/constants/theme";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAppState } from "@/context/AppState";

export default function ScanQrScreen() {
  const { joinExistingGroup } = useAppState();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const handledRef = useRef(false);

  async function handleScanned(rawValue: string) {
    if (handledRef.current) return;
    const code = rawValue.trim().toUpperCase();
    if (code.length !== 5) return;

    handledRef.current = true;
    setChecking(true);
    setError(null);
    try {
      await joinExistingGroup(code);
      router.replace("/(tabs)");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Código no válido");
      handledRef.current = false;
    } finally {
      setChecking(false);
    }
  }

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.permissionContent}>
          <Text style={styles.title}>Necesitamos la cámara</Text>
          <Text style={styles.subtitle}>
            Para escanear el QR de invitación de tu grupo.
          </Text>
          <PrimaryButton label="Dar permiso" onPress={requestPermission} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={(result) => handleScanned(result.data)}
      />
      <View style={styles.frameOverlay} pointerEvents="none">
        <View style={styles.frame} />
      </View>
      <SafeAreaView style={styles.footer} edges={["bottom"]}>
        <Text style={styles.hint}>
          {checking ? "Comprobando código..." : "Apunta al QR de invitación"}
        </Text>
        {error && <Text style={styles.error}>{error}</Text>}
        <View style={{ height: spacing.sm }} />
        <PrimaryButton label="Volver" variant="secondary" onPress={() => router.back()} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  camera: {
    flex: 1,
  },
  frameOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  frame: {
    width: 220,
    height: 220,
    borderRadius: radii.lg,
    borderWidth: 3,
    borderColor: colors.accent,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: "rgba(10,10,11,0.85)",
    paddingTop: spacing.md,
  },
  hint: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textDim,
    textAlign: "center",
  },
  error: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.danger,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  permissionContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textDim,
    textAlign: "center",
    marginBottom: spacing.md,
  },
});
