export const teamRoles = ["order_operator", "catalog_editor", "analytics_viewer", "store_manager"] as const;
export type TeamRole = (typeof teamRoles)[number];

export type TeamCapability = "dashboard" | "orders" | "catalog" | "analytics";

const capabilitiesByRole: Record<TeamRole, readonly TeamCapability[]> = {
  order_operator: ["dashboard", "orders"],
  catalog_editor: ["dashboard", "catalog"],
  analytics_viewer: ["dashboard", "analytics"],
  store_manager: ["dashboard", "orders", "catalog", "analytics"],
};

export const teamRoleLabels: Record<TeamRole, string> = {
  order_operator: "متابعة الطلبات",
  catalog_editor: "إدارة المنتجات",
  analytics_viewer: "عرض التحليلات",
  store_manager: "مدير المتجر",
};

export function isTeamRole(value: string): value is TeamRole {
  return (teamRoles as readonly string[]).includes(value);
}

export function canTeamRoleAccess(role: TeamRole, capability: TeamCapability) {
  return capabilitiesByRole[role].includes(capability);
}

export function isActiveTeamInvite(invite: { expiresAt: Date | null; acceptedAt?: Date | null; revokedAt?: Date | null }, now = new Date()) {
  return !invite.acceptedAt && !invite.revokedAt && (invite.expiresAt === null || invite.expiresAt.getTime() > now.getTime());
}
