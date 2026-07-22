import { Ionicons } from "@expo/vector-icons";
import { ScreenPlaceholder } from "@/components/ScreenPlaceholder";
import { colors } from "@/constants/theme";

export default function ActionScreen() {
  return (
    <ScreenPlaceholder
      icon={<Ionicons name="camera" size={48} color={colors.accent} />}
      title="Cámara Libre"
      description="La cámara freestyle con texto superpuesto llega en la Fase 4."
    />
  );
}
