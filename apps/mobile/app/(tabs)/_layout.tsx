import { Redirect, Tabs } from "expo-router";
import { TabBar, type TabRoute } from "@/components/TabBar";
import { useAppState } from "@/context/AppState";

export default function TabLayout() {
  const { status } = useAppState();

  if (status !== "ready") {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={({ state, navigation }) => (
        <TabBar
          routes={state.routes.map((route, index) => ({
            key: route.key,
            name: route.name,
            focused: state.index === index,
          }))}
          onPress={(route: TabRoute) => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!route.focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          }}
        />
      )}
    >
      <Tabs.Screen name="intel" />
      <Tabs.Screen name="bounties" />
      <Tabs.Screen name="action" />
      <Tabs.Screen name="shop" />
      <Tabs.Screen name="index" />
    </Tabs>
  );
}
