import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { colors, fonts, radii, spacing } from "@/constants/theme";

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
};

export function PrimaryButton({
  label,
  onPress,
  loading,
  disabled,
  variant = "primary",
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        variant === "secondary" && styles.secondary,
        variant === "danger" && styles.danger,
        isDisabled && styles.disabled,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "secondary" ? colors.textPrimary : colors.accentOn}
        />
      ) : (
        <Text
          style={[
            styles.label,
            variant === "secondary" && styles.labelSecondary,
            variant === "danger" && styles.labelDanger,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  secondary: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  danger: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.danger,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontFamily: fonts.monoBold,
    fontSize: 14,
    letterSpacing: 0.5,
    color: colors.accentOn,
  },
  labelSecondary: {
    color: colors.textPrimary,
  },
  labelDanger: {
    color: colors.danger,
  },
});
