import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, radii, spacing } from "@/constants/theme";

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  intel: "scan-outline",
  bounties: "flag-outline",
  action: "camera",
  shop: "cart-outline",
  index: "stats-chart-outline",
};

const LABELS: Record<string, string> = {
  intel: "Intel",
  bounties: "Bounties",
  action: "Action",
  shop: "Shop",
  index: "Ranks",
};

export type TabRoute = {
  key: string;
  name: string;
  focused: boolean;
};

type Props = {
  routes: TabRoute[];
  onPress: (route: TabRoute) => void;
};

export function TabBar({ routes, onPress }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, spacing.sm) },
      ]}
    >
      {routes.map((route) => {
        const isAction = route.name === "action";
        const icon = ICONS[route.name] ?? "ellipse-outline";
        const label = LABELS[route.name] ?? route.name;

        if (isAction) {
          return (
            <Pressable
              key={route.key}
              onPress={() => onPress(route)}
              style={styles.actionButton}
              accessibilityRole="button"
              accessibilityLabel={label}
            >
              <Ionicons name={icon} size={24} color={colors.accentOn} />
            </Pressable>
          );
        }

        return (
          <Pressable
            key={route.key}
            onPress={() => onPress(route)}
            style={styles.tabButton}
            accessibilityRole="button"
            accessibilityLabel={label}
          >
            <Ionicons
              name={icon}
              size={22}
              color={route.focused ? colors.accent : colors.textFaint}
            />
            <Text
              style={[
                styles.label,
                { color: route.focused ? colors.accent : colors.textFaint },
              ]}
            >
              {label.toUpperCase()}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  label: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  actionButton: {
    width: 52,
    height: 52,
    borderRadius: radii.lg,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -20,
    shadowColor: colors.accent,
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
});
