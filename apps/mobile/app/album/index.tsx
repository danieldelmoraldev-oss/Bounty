import { useCallback, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { AlbumFolder } from "@bounty/shared";
import * as api from "@/lib/api";
import { colors, fonts, radii, spacing } from "@/constants/theme";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAppState } from "@/context/AppState";

function formatRange(startedAt: string, endedAt: string | null): string {
  const start = new Date(startedAt).toLocaleDateString();
  if (!endedAt) return `${start} · en directo`;
  return start;
}

export default function AlbumFoldersScreen() {
  const { group } = useAppState();
  const router = useRouter();
  const [folders, setFolders] = useState<AlbumFolder[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!group) return;
      setLoading(true);
      api
        .fetchAlbumFolders(group.id)
        .then(setFolders)
        .finally(() => setLoading(false));
    }, [group]),
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Álbum</Text>
        <PrimaryButton label="Cerrar" variant="secondary" onPress={() => router.back()} />
      </View>

      <FlatList
        data={folders}
        keyExtractor={(f) => f.partyId}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={{ gap: spacing.sm }}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.emptyText}>
              Todavía no hay fiestas con fotos. En cuanto se apruebe un reto o alguien publique en
              la cámara libre, aparecerán aquí.
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.folderCard}
            onPress={() => router.push(`/album/${item.partyId}`)}
          >
            <View>
              {item.coverUrl ? (
                <Image source={{ uri: item.coverUrl }} style={styles.cover} resizeMode="cover" />
              ) : (
                <View style={styles.coverPlaceholder} />
              )}
              <Pressable
                style={styles.recapButton}
                onPress={(e) => {
                  e.stopPropagation();
                  router.push(`/album/recap/${item.partyId}`);
                }}
              >
                <Ionicons name="play" size={14} color={colors.accentOn} />
              </Pressable>
            </View>
            <Text style={styles.folderDate}>{formatRange(item.startedAt, item.endedAt)}</Text>
            <Text style={styles.folderCount}>{item.itemCount} fotos</Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.textPrimary,
  },
  grid: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  emptyText: {
    fontFamily: fonts.mono,
    fontSize: 13,
    color: colors.textDim,
    textAlign: "center",
    marginTop: spacing.xl,
    lineHeight: 19,
  },
  folderCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    overflow: "hidden",
    marginBottom: spacing.sm,
  },
  cover: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: colors.surfaceElevated,
  },
  coverPlaceholder: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: colors.surfaceElevated,
  },
  recapButton: {
    position: "absolute",
    bottom: spacing.xs,
    right: spacing.xs,
    width: 28,
    height: 28,
    borderRadius: radii.full,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  folderDate: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textPrimary,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
  },
  folderCount: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textFaint,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
});
