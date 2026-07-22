import { Ionicons } from "@expo/vector-icons";
import { ScreenPlaceholder } from "@/components/ScreenPlaceholder";
import { colors } from "@/constants/theme";

export default function ShopScreen() {
  return (
    <ScreenPlaceholder
      icon={<Ionicons name="cart-outline" size={48} color={colors.secondary} />}
      title="Black Market"
      description="Buffs, sabotajes y cosméticos llegan en la Fase 5."
    />
  );
}
