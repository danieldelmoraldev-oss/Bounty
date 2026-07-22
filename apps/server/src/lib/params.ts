export function firstParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0]! : value;
}
