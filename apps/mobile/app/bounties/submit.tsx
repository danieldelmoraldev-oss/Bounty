import { useRef, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as api from "@/lib/api";
import { colors, fonts, radii, spacing } from "@/constants/theme";
import { PrimaryButton } from "@/components/PrimaryButton";

export default function SubmitChallengeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    groupId: string;
    partyId: string;
    assignmentId: string;
    prompt: string;
    difficulty: string;
    points: string;
  }>();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCapture() {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      const result = await cameraRef.current.takePictureAsync({ quality: 0.4, base64: true });
      if (result?.base64) {
        // En native, `base64` es el payload puro (hay que añadirle el prefijo
        // data:). En web, expo-camera ya devuelve el data URL completo tanto
        // en `uri` como en `base64` -- si ya viene con el prefijo, se usa tal cual.
        const dataUrl = result.base64.startsWith("data:")
          ? result.base64
          : `data:image/jpeg;base64,${result.base64}`;
        setPhotoDataUrl(dataUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo hacer la foto");
    } finally {
      setCapturing(false);
    }
  }

  async function handleSubmit() {
    if (!photoDataUrl) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.submitChallenge(params.groupId, params.partyId, params.assignmentId, photoDataUrl);
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar la prueba");
    } finally {
      setSubmitting(false);
    }
  }

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.permissionContent}>
          <Text style={styles.title}>Necesitamos la cámara</Text>
          <Text style={styles.subtitle}>Para poder hacer la foto de prueba del reto.</Text>
          <PrimaryButton label="Dar permiso" onPress={requestPermission} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {photoDataUrl ? (
        <Image source={{ uri: photoDataUrl }} style={styles.preview} />
      ) : (
        <CameraView ref={cameraRef} style={styles.camera} />
      )}

      <SafeAreaView style={styles.promptBanner} edges={["top"]}>
        <Text style={styles.promptLabel}>NIVEL {params.difficulty} · {params.points} PTS</Text>
        <Text style={styles.promptText}>{params.prompt}</Text>
      </SafeAreaView>

      <SafeAreaView style={styles.footer} edges={["bottom"]}>
        {error && <Text style={styles.error}>{error}</Text>}
        {photoDataUrl ? (
          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            <PrimaryButton
              label="Repetir"
              variant="secondary"
              onPress={() => setPhotoDataUrl(null)}
              style={{ flex: 1 }}
            />
            <PrimaryButton
              label={submitting ? "Enviando..." : "Enviar prueba"}
              onPress={handleSubmit}
              loading={submitting}
              style={{ flex: 1 }}
            />
          </View>
        ) : (
          <Pressable onPress={handleCapture} style={styles.shutter} disabled={capturing}>
            <Ionicons name="camera" size={28} color={colors.accentOn} />
          </Pressable>
        )}
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
  preview: {
    flex: 1,
  },
  promptBanner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(10,10,11,0.85)",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  promptLabel: {
    fontFamily: fonts.monoBold,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.accent,
    marginBottom: 4,
  },
  promptText: {
    fontFamily: fonts.mono,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    paddingTop: spacing.md,
    backgroundColor: "rgba(10,10,11,0.85)",
    alignItems: "center",
  },
  shutter: {
    width: 68,
    height: 68,
    borderRadius: radii.full,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  error: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.danger,
    textAlign: "center",
    marginBottom: spacing.sm,
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
