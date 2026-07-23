import { useCallback, useState } from "react";
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { SHOP_CATALOG, type ShopItem, type ShopState } from "@bounty/shared";
import * as api from "@/lib/api";
import { colors, fonts, radii, spacing } from "@/constants/theme";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAppState } from "@/context/AppState";

const EFFECT_LABEL: Record<string, string> = {
  point_buff: "Buff de puntos activo",
  camera_broken: "Tu cámara está rota",
  level1_blocked: "Tienes el nivel 1 bloqueado",
};

export default function ShopScreen() {
  const { user, group, refreshGroup } = useAppState();
  const [state, setState] = useState<ShopState | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyItem, setBusyItem] = useState<string | null>(null);
  const [targetPickerFor, setTargetPickerFor] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!group) return;
    // El grupo puede tener miembros nuevos desde la última vez que se cargó
    // (alguien se une durante la fiesta) y hacen falta para elegir objetivo.
    const [shop] = await Promise.all([api.fetchShopState(group.id), refreshGroup()]);
    setState(shop);
  }, [group, refreshGroup]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [load]),
  );

  async function onRefresh() {
    setRefreshing(true);
    await load().catch(() => null);
    setRefreshing(false);
  }

  async function handleBuy(item: ShopItem, targetUserId?: string) {
    if (!group) return;
    setBusyItem(item.id);
    try {
      const next = await api.purchaseItem(group.id, item.id, targetUserId);
      setState(next);
      setTargetPickerFor(null);
    } catch (err) {
      Alert.alert("No se pudo comprar", err instanceof Error ? err.message : "");
    } finally {
      setBusyItem(null);
    }
  }

  async function handleEquip(kind: "frame" | "title", value: string | null) {
    if (!group) return;
    setBusyItem(`equip-${kind}`);
    try {
      const next = await api.equipCosmetic(group.id, { [kind]: value });
      setState(next);
    } catch (err) {
      Alert.alert("No se pudo equipar", err instanceof Error ? err.message : "");
    } finally {
      setBusyItem(null);
    }
  }

  if (!group || !user || loading || !state) return null;

  const others = group.members.filter((m) => m.userId !== user.id);
  const buffs = SHOP_CATALOG.filter((i) => i.kind === "point_buff");
  const sabotages = SHOP_CATALOG.filter((i) => i.requiresTarget);
  const frames = SHOP_CATALOG.filter((i) => i.kind === "cosmetic_frame");
  const titles = SHOP_CATALOG.filter((i) => i.kind === "cosmetic_title");

  const hasActiveBuff = state.activeEffects.some((e) => e.kind === "point_buff");

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      >
        <View style={styles.header}>
          <Ionicons name="cart-outline" size={28} color={colors.secondary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Black Market</Text>
            <Text style={styles.subtitle}>{group.name}</Text>
          </View>
          <View style={styles.balanceChip}>
            <Text style={styles.balanceText}>{state.balance} pts</Text>
          </View>
        </View>

        {!state.hasActiveParty && (
          <View style={styles.noticeCard}>
            <Text style={styles.noticeText}>
              Los buffs y sabotajes solo se pueden comprar durante el Modo Fiesta. Los
              cosméticos sí están disponibles ahora.
            </Text>
          </View>
        )}

        {state.activeEffects.length > 0 && (
          <View style={styles.effectsRow}>
            {state.activeEffects.map((e, i) => (
              <View key={i} style={styles.effectChip}>
                <Text style={styles.effectText}>
                  {EFFECT_LABEL[e.kind] ?? e.kind}
                  {e.multiplier ? ` x${e.multiplier}` : ""}
                </Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.sectionTitle}>BUFFS</Text>
        {buffs.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDescription}>{item.description}</Text>
            <View style={styles.itemFooter}>
              <Text style={styles.itemCost}>{item.cost} pts</Text>
              <PrimaryButton
                label="Comprar"
                onPress={() => handleBuy(item)}
                loading={busyItem === item.id}
                disabled={!state.hasActiveParty || hasActiveBuff || state.balance < item.cost}
              />
            </View>
          </View>
        ))}

        <Text style={styles.sectionTitle}>SABOTAJES</Text>
        {sabotages.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDescription}>{item.description}</Text>
            {targetPickerFor === item.id ? (
              <View style={{ gap: spacing.xs }}>
                {others.map((m) => (
                  <PrimaryButton
                    key={m.userId}
                    label={`Sobre ${m.displayName}`}
                    variant="danger"
                    onPress={() => handleBuy(item, m.userId)}
                    loading={busyItem === item.id}
                  />
                ))}
                <PrimaryButton
                  label="Cancelar"
                  variant="secondary"
                  onPress={() => setTargetPickerFor(null)}
                />
              </View>
            ) : (
              <View style={styles.itemFooter}>
                <Text style={styles.itemCost}>{item.cost} pts</Text>
                <PrimaryButton
                  label="Sabotear"
                  variant="danger"
                  onPress={() => setTargetPickerFor(item.id)}
                  disabled={!state.hasActiveParty || state.balance < item.cost || others.length === 0}
                />
              </View>
            )}
          </View>
        ))}

        <Text style={styles.sectionTitle}>MARCOS</Text>
        {frames.map((item) => {
          const owned = state.ownedFrames.includes(item.value!);
          const equipped = state.equippedFrame === item.value;
          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.cosmeticRow}>
                <View style={[styles.frameSwatch, { borderColor: item.value }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDescription}>{item.description}</Text>
                </View>
              </View>
              <View style={styles.itemFooter}>
                <Text style={styles.itemCost}>{owned ? "Comprado" : `${item.cost} pts`}</Text>
                {owned ? (
                  <PrimaryButton
                    label={equipped ? "Quitar" : "Equipar"}
                    variant="secondary"
                    onPress={() => handleEquip("frame", equipped ? null : item.value!)}
                    loading={busyItem === "equip-frame"}
                  />
                ) : (
                  <PrimaryButton
                    label="Comprar"
                    onPress={() => handleBuy(item)}
                    loading={busyItem === item.id}
                    disabled={state.balance < item.cost}
                  />
                )}
              </View>
            </View>
          );
        })}

        <Text style={styles.sectionTitle}>TÍTULOS</Text>
        {titles.map((item) => {
          const owned = state.ownedTitles.includes(item.value!);
          const equipped = state.equippedTitle === item.value;
          return (
            <View key={item.id} style={styles.card}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemDescription}>{item.description}</Text>
              <View style={styles.itemFooter}>
                <Text style={styles.itemCost}>{owned ? "Comprado" : `${item.cost} pts`}</Text>
                {owned ? (
                  <PrimaryButton
                    label={equipped ? "Quitar" : "Equipar"}
                    variant="secondary"
                    onPress={() => handleEquip("title", equipped ? null : item.value!)}
                    loading={busyItem === "equip-title"}
                  />
                ) : (
                  <PrimaryButton
                    label="Comprar"
                    onPress={() => handleBuy(item)}
                    loading={busyItem === item.id}
                    disabled={state.balance < item.cost}
                  />
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
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
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textDim,
  },
  balanceChip: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  balanceText: {
    fontFamily: fonts.monoBold,
    fontSize: 13,
    color: colors.gold,
  },
  noticeCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  noticeText: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textDim,
    lineHeight: 18,
  },
  effectsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  effectChip: {
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  effectText: {
    fontFamily: fonts.monoBold,
    fontSize: 10,
    color: colors.secondary,
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
  itemName: {
    fontFamily: fonts.displayBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  itemDescription: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textDim,
    lineHeight: 17,
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemCost: {
    fontFamily: fonts.monoBold,
    fontSize: 13,
    color: colors.gold,
  },
  cosmeticRow: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
  },
  frameSwatch: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    borderWidth: 4,
    backgroundColor: colors.surfaceElevated,
  },
});
