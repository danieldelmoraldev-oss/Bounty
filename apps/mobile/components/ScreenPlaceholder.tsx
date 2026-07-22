import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts, spacing } from "@/constants/theme";

type Props = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

export function ScreenPlaceholder({ icon, title, description }: Props) {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.content}>
        {icon}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
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
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.textPrimary,
    textAlign: "center",
  },
  description: {
    fontFamily: fonts.mono,
    fontSize: 13,
    color: colors.textDim,
    textAlign: "center",
    lineHeight: 20,
  },
});
