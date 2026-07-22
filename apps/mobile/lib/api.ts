import type { HealthResponse } from "@bounty/shared";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function getHealth(): Promise<HealthResponse> {
  if (!API_URL) {
    throw new Error("EXPO_PUBLIC_API_URL no está definida");
  }
  const response = await fetch(`${API_URL}/health`);
  if (!response.ok && response.status !== 503) {
    throw new Error(`Health check falló con estado ${response.status}`);
  }
  return response.json();
}
