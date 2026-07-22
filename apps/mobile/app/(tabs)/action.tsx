import { useCallback, useRef, useState } from "react";
import { Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as api from "@/lib/api";
import { uploadPhoto } from "@/lib/cloudinary";
import { colors, fonts, radii, spacing } from "@/constants/theme";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAppState } from "@/context/AppState";

export default function ActionScreen() {
  const { group } = useAppState();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [partyId, setPartyId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [capturing, setCapturing] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posted, setPosted] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!group) return;
      setChecking(true);
      api
        .fetchActiveParty(group.id)
        .then((state) => setPartyId(state?.party.id ?? null))
        .finally(() => setChecking(false));
    }, [group]),
  );

  async function handleCapture() {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      const result = await cameraRef.current.takePictureAsync({ quality: 0.4 });
      if (result?.uri) setPhotoUri(result.uri);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo hacer la foto");
    } finally {
      setCapturing(false);
    }
  }

  async function handlePost() {
    if (!photoUri || !group || !partyId) return;
    setPosting(true);
    setError(null);
    try {
      const photoUrl = await uploadPhoto(photoUri);
      await api.postFreestyle(group.id, partyId, photoUrl, caption.trim() || undefined);
      setPhotoUri(null);
      setCaption("");
      setPosted(true);
      setTimeout(() => setPosted(false), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo publicar la foto");
    } finally {
      setPosting(false);
    }
  }

  if (!group || checking || !permission) {
    return <View style={styles.container} />;
  }

  if (!partyId) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.emptyContent}>
          <Ionicons name="camera-outline" size={48} color={colors.accent} />
          <Text style={styles.title}>Cámara Libre</Text>
          <Text style={styles.subtitle}>
            Solo está disponible durante el Modo Fiesta. Espera a que el admin empiece la noche.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.emptyContent}>
          <Text style={styles.title}>Necesitamos la cámara</Text>
          <Text style={styles.subtitle}>Para la cámara libre del Modo Fiesta.</Text>
          <PrimaryButton label="Dar permiso" onPress={requestPermission} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={styles.preview} />
      ) : (
        <CameraView ref={cameraRef} style={styles.camera} />
      )}

      {posted && (
        <View style={styles.postedBanner}>
          <Ionicons name="checkmark-circle" size={18} color={colors.accent} />
          <Text style={styles.postedText}>Añadida al álbum</Text>
        </View>
      )}

      <SafeAreaView style={styles.footer} edges={["bottom"]}>
        {error && <Text style={styles.error}>{error}</Text>}
        {photoUri ? (
          <View style={{ gap: spacing.sm }}>
            <TextInput
              value={caption}
              onChangeText={setCaption}
              placeholder="Añade un texto (opcional)"
              placeholderTextColor={colors.textFaint}
              maxLength={140}
              style={styles.captionInput}
            />
            <View style={{ flexDirection: "row", gap: spacing.sm }}>
              <PrimaryButton
                label="Repetir"
                variant="secondary"
                onPress={() => setPhotoUri(null)}
                style={{ flex: 1 }}
              />
              <PrimaryButton
                label={posting ? "Publicando..." : "Publicar"}
                onPress={handlePost}
                loading={posting}
                style={{ flex: 1 }}
              />
            </View>
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
  postedBanner: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.xs,
  },
  postedText: {
    fontFamily: fonts.monoBold,
    fontSize: 12,
    color: colors.accent,
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
  captionInput: {
    fontFamily: fonts.mono,
    fontSize: 13,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  error: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.danger,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  emptyContent: {
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
