export type PluginAuthContext = {
  props?: { ownerSub?: string };
  auth?: { userId?: string; scope?: string[] };
};

export function isOwnerAuthorized(
  allowedSub: string | undefined,
  context: PluginAuthContext
): boolean {
  return Boolean(
    allowedSub &&
    context.props?.ownerSub === allowedSub &&
    context.auth?.userId === allowedSub &&
    context.auth?.scope?.includes("analytics:read")
  );
}
