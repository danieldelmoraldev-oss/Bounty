import { useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AVATAR_COLORS, AVATAR_EMOJIS } from "@/constants/avatars";
import { colors, fonts, radii, spacing } from "@/constants/theme";
import { PrimaryButton } from "@/components/PrimaryButton";
import { InviteQr } from "@/components/InviteQr";
import { useAppState } from "@/context/AppState";

export default function IntelScreen() {
  const { user, group, refreshGroup, leaveCurrentGroup, updateMyProfile } = useAppState();
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [leaving, setLeaving] = useState(false);

  if (!group || !user) return null;

  async function onRefresh() {
    setRefreshing(true);
    await refreshGroup().catch(() => null);
    setRefreshing(false);
  }

  function confirmLeave() {
    if (!group) return;
    Alert.alert(
      "Salir del grupo",
      `¿Seguro que quieres salir de "${group.name}"? Podrás volver a unirte con el código.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Salir",
          style: "destructive",
          onPress: async () => {
            setLeaving(true);
            try {
              await leaveCurrentGroup();
            } finally {
              setLeaving(false);
            }
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      >
        <View style={styles.header}>
          <Ionicons name="scan-outline" size={28} color={colors.tertiary} />
          <View>
            <Text style={styles.groupName}>{group.name}</Text>
            <Text style={styles.groupMeta}>{group.members.length} en el escuadrón</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>CÓDIGO DE INVITACIÓN</Text>
          <View style={styles.inviteRow}>
            <InviteQr code={group.code} size={96} />
            <View style={styles.inviteRowText}>
              <Text style={styles.code}>{group.code}</Text>
              <PrimaryButton
                label="Compartir"
                variant="secondary"
                onPress={() =>
                  Share.share({
                    message: `Únete a mi grupo "${group.name}" en Bounty con el código ${group.code}`,
                  })
                }
              />
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>ESCUADRÓN</Text>
        <View style={styles.card}>
          {group.members.map((member) => (
            <View key={member.userId} style={styles.memberRow}>
              <View style={[styles.avatar, { backgroundColor: member.avatarColor }]}>
                <Text style={styles.avatarEmoji}>{member.avatarEmoji}</Text>
              </View>
              <Text style={styles.memberName}>{member.displayName}</Text>
              {member.role === "admin" && (
                <View style={styles.adminBadge}>
                  <Text style={styles.adminBadgeText}>ADMIN</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>TU PERFIL</Text>
        <View style={styles.card}>
          {editing ? (
            <ProfileEditor
              initialName={user.displayName}
              initialEmoji={user.avatarEmoji}
              initialColor={user.avatarColor}
              onCancel={() => setEditing(false)}
              onSave={async (patch) => {
                await updateMyProfile(patch);
                await refreshGroup().catch(() => null);
                setEditing(false);
              }}
            />
          ) : (
            <View style={styles.memberRow}>
              <View style={[styles.avatar, { backgroundColor: user.avatarColor }]}>
                <Text style={styles.avatarEmoji}>{user.avatarEmoji}</Text>
              </View>
              <Text style={styles.memberName}>{user.displayName}</Text>
              <PrimaryButton label="Editar" variant="secondary" onPress={() => setEditing(true)} />
            </View>
          )}
        </View>

        <View style={styles.leaveWrap}>
          <PrimaryButton
            label={leaving ? "Saliendo..." : "Salir del grupo"}
            variant="danger"
            onPress={confirmLeave}
            loading={leaving}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileEditor({
  initialName,
  initialEmoji,
  initialColor,
  onSave,
  onCancel,
}: {
  initialName: string;
  initialEmoji: string;
  initialColor: string;
  onSave: (patch: { displayName: string; avatarEmoji: string; avatarColor: string }) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [emoji, setEmoji] = useState(initialEmoji);
  const [color, setColor] = useState(initialColor);
  const [saving, setSaving] = useState(false);

  return (
    <View style={{ gap: spacing.sm }}>
      <TextInput
        value={name}
        onChangeText={setName}
        maxLength={24}
        style={styles.input}
        placeholderTextColor={colors.textFaint}
      />
      <View style={styles.emojiGrid}>
        {AVATAR_EMOJIS.map((e) => (
          <Text
            key={e}
            onPress={() => setEmoji(e)}
            style={[styles.emojiCell, e === emoji && styles.emojiCellSelected]}
          >
            {e}
          </Text>
        ))}
      </View>
      <View style={styles.colorRow}>
        {AVATAR_COLORS.map((c) => (
          <Text
            key={c}
            onPress={() => setColor(c)}
            style={[
              styles.colorDot,
              { backgroundColor: c },
              c === color && styles.colorDotSelected,
            ]}
          />
        ))}
      </View>
      <View style={{ flexDirection: "row", gap: spacing.sm }}>
        <View style={{ flex: 1 }}>
          <PrimaryButton label="Cancelar" variant="secondary" onPress={onCancel} />
        </View>
        <View style={{ flex: 1 }}>
          <PrimaryButton
            label="Guardar"
            loading={saving}
            onPress={async () => {
              setSaving(true);
              try {
                await onSave({ displayName: name.trim(), avatarEmoji: emoji, avatarColor: color });
              } finally {
                setSaving(false);
              }
            }}
          />
        </View>
      </View>
    </View>
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
  groupName: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.textPrimary,
  },
  groupMeta: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textDim,
  },
  sectionTitle: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.textFaint,
    marginTop: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardLabel: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.textFaint,
  },
  inviteRow: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
  },
  inviteRowText: {
    flex: 1,
    gap: spacing.sm,
  },
  code: {
    fontFamily: fonts.monoBold,
    fontSize: 26,
    letterSpacing: 4,
    color: colors.textPrimary,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEmoji: {
    fontSize: 20,
  },
  memberName: {
    flex: 1,
    fontFamily: fonts.mono,
    fontSize: 14,
    color: colors.textPrimary,
  },
  adminBadge: {
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  adminBadgeText: {
    fontFamily: fonts.monoBold,
    fontSize: 10,
    color: colors.gold,
  },
  input: {
    fontFamily: fonts.mono,
    fontSize: 14,
    color: colors.textPrimary,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  emojiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  emojiCell: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    textAlign: "center",
    lineHeight: 34,
    fontSize: 18,
  },
  emojiCellSelected: {
    borderColor: colors.accent,
  },
  colorRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: radii.full,
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorDotSelected: {
    borderColor: colors.textPrimary,
  },
  leaveWrap: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
});
