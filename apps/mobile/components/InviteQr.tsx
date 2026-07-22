import { StyleSheet, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { radii } from "@/constants/theme";

export function InviteQr({ code, size = 180 }: { code: string; size?: number }) {
  return (
    <View style={styles.card}>
      <QRCode value={code} size={size} color="#0A0A0B" backgroundColor="#FFFFFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: radii.lg,
  },
});
