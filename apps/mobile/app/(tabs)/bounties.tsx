import { Ionicons } from "@expo/vector-icons";
import { ScreenPlaceholder } from "@/components/ScreenPlaceholder";
import { colors } from "@/constants/theme";

export default function BountiesScreen() {
  return (
    <ScreenPlaceholder
      icon={<Ionicons name="flag-outline" size={48} color={colors.accent} />}
      title="Bounties"
      description="El menú de retos por dificultad se construye en la Fase 3."
    />
  );
}
