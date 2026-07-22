import { Redirect, Stack } from "expo-router";
import { useAppState } from "@/context/AppState";

export default function OnboardingLayout() {
  const { status } = useAppState();

  if (status === "ready") {
    return <Redirect href="/(tabs)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
