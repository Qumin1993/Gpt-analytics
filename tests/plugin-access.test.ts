import { it, expect } from "vitest";
import { isOwnerAuthorized, type PluginAuthContext } from "../src/auth/plugin-access.js";

const owner = "owner123";
const valid: PluginAuthContext = {
  props: { ownerSub: owner },
  auth: { userId: owner, scope: ["analytics:read"] }
};

it("accepts the verified owner with analytics:read", () => {
  expect(isOwnerAuthorized(owner, valid)).toBe(true);
});

it("rejects missing, mismatched and underscoped identities without trusting legacy bearer credentials", () => {
  const attempts: PluginAuthContext[] = [
    {},
    { props: { ownerSub: owner } },
    { auth: { userId: owner, scope: ["analytics:read"] } },
    { props: { ownerSub: owner }, auth: { userId: owner, scope: [] } },
    { props: { ownerSub: owner }, auth: { userId: "intruder", scope: ["analytics:read"] } },
    { props: { ownerSub: "intruder" }, auth: { userId: owner, scope: ["analytics:read"] } }
  ];
  for (const context of attempts) {
    expect(isOwnerAuthorized(owner, context)).toBe(false);
  }
  expect(isOwnerAuthorized(undefined, valid)).toBe(false);
  expect(isOwnerAuthorized("", valid)).toBe(false);
});
