export type DataMode = "mock" | "live";

export interface HealthResponse {
  status: "ok" | "error";
  dataMode: DataMode;
  db: "connected" | "disconnected";
}
