import { Ionicons } from "@expo/vector-icons";
import { ScreenPlaceholder } from "@/components/ScreenPlaceholder";
import { colors } from "@/constants/theme";

export default function IntelScreen() {
  return (
    <ScreenPlaceholder
      icon={<Ionicons name="scan-outline" size={48} color={colors.tertiary} />}
      title="Intel"
      description="Aquí verás el estado de la fiesta en directo y las notificaciones del grupo. Llega en la Fase 2."
    />
  );
}
