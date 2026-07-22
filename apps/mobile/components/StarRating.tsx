import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts, spacing } from "@/constants/theme";

type Props = {
  average: number | null;
  count: number;
  myStars: number | null;
  onRate: (stars: number) => void;
};

export function StarRating({ average, count, myStars, onRate }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable key={n} onPress={() => onRate(n)} hitSlop={6}>
            <Ionicons
              name={n <= (myStars ?? 0) ? "star" : "star-outline"}
              size={18}
              color={n <= (myStars ?? 0) ? colors.gold : colors.textFaint}
            />
          </Pressable>
        ))}
      </View>
      {average !== null && (
        <Text style={styles.summary}>
          {average.toFixed(1)} ({count})
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  stars: {
    flexDirection: "row",
    gap: 2,
  },
  summary: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textFaint,
  },
});
