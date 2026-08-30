import { describe, expect, it } from "vitest";
import { canTeamRoleAccess, isActiveTeamInvite, isTeamRole } from "./teamAccess";

describe("store team roles", () => {
  it("keeps operations roles least-privilege", () => {
    expect(canTeamRoleAccess("order_operator", "orders")).toBe(true);
    expect(canTeamRoleAccess("order_operator", "catalog")).toBe(false);
    expect(canTeamRoleAccess("analytics_viewer", "analytics")).toBe(true);
    expect(canTeamRoleAccess("catalog_editor", "orders")).toBe(false);
  });

  it("accepts only explicit team roles", () => {
    expect(isTeamRole("store_manager")).toBe(true);
    expect(isTeamRole("admin")).toBe(false);
  });

  it("accepts only a live, unused, unrevokeed invite", () => {
    const now = new Date("2026-08-25T10:00:00.000Z");
    expect(isActiveTeamInvite({ expiresAt: new Date("2026-08-25T11:00:00.000Z") }, now)).toBe(true);
    expect(isActiveTeamInvite({ expiresAt: new Date("2026-08-25T11:00:00.000Z"), acceptedAt: now }, now)).toBe(false);
    expect(isActiveTeamInvite({ expiresAt: new Date("2026-08-25T11:00:00.000Z"), revokedAt: now }, now)).toBe(false);
    expect(isActiveTeamInvite({ expiresAt: new Date("2026-08-25T09:59:00.000Z") }, now)).toBe(false);
  });

  it("keeps an unlimited invite active until accepted or revoked", () => {
    const now = new Date("2026-08-25T10:00:00.000Z");
    expect(isActiveTeamInvite({ expiresAt: null }, now)).toBe(true);
    expect(isActiveTeamInvite({ expiresAt: null, acceptedAt: now }, now)).toBe(false);
    expect(isActiveTeamInvite({ expiresAt: null, revokedAt: now }, now)).toBe(false);
  });
});
