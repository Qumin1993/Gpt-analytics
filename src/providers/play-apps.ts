export interface PlayApp { packageName: string; name?: string; }
const PACKAGE = /^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$/;
export function parsePlayApps(raw: string | undefined): PlayApp[] {
  if (!raw) return [];
  let data: unknown;
  try { data = JSON.parse(raw); } catch { throw new Error("Invalid PLAY_APPS_JSON"); }
  if (!Array.isArray(data) || data.length > 500) throw new Error("Invalid PLAY_APPS_JSON");
  const seen = new Set<string>();
  return data.map((item): PlayApp => {
    if (typeof item !== "object" || item === null || Array.isArray(item)) throw new Error("Invalid Play app");
    const obj = item as Record<string, unknown>;
    if (typeof obj.packageName !== "string" || !PACKAGE.test(obj.packageName)) throw new Error("Invalid Play package name");
    if (obj.name !== undefined && (typeof obj.name !== "string" || obj.name.length > 200)) throw new Error("Invalid Play app name");
    if (seen.has(obj.packageName)) throw new Error("Duplicate Play package name");
    seen.add(obj.packageName);
    return { packageName: obj.packageName, ...(obj.name === undefined ? {} : { name: obj.name as string }) };
  });
}
