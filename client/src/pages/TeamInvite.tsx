import { CheckCircle2, Link2, ShieldCheck, UserRoundPlus } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";

const INVITE_KEY = "marj-team-invite-token";

export default function TeamInvite() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const token = new URLSearchParams(window.location.search).get("token") || sessionStorage.getItem(INVITE_KEY) || "";
  const { user, loading } = useAuth();
  const [acceptedRole, setAcceptedRole] = useState<string | null>(null);
  const accept = trpc.team.acceptInvite.useMutation({
    onSuccess: (result) => { sessionStorage.removeItem(INVITE_KEY); setAcceptedRole(result.role); },
  });
  const beginLogin = () => { if (token) sessionStorage.setItem(INVITE_KEY, token); startLogin(); };
  const labels = language === "en" ? {
    incomplete: "Incomplete invitation link", request: "Ask the store owner for a new secure invitation link.", checking: "Checking your account...", eyebrow: "MARJ / TEAM", join: "Join the store team", signInCopy: "Sign in with the account this staff member will use, then review and accept the invitation.", signIn: "Sign in to accept the invitation", added: "Your account has joined the team", active: "Your role is now active:", openDashboard: "Open store dashboard", invitation: "Store team invitation", review: "The store owner selected a role for you. This invitation does not provide access to payments or sensitive settings.", accepting: "Accepting invitation...", accept: "Accept invitation",
  } : {
    incomplete: "رابط الدعوة غير مكتمل", request: "اطلب من مالك المتجر رابط دعوة آمنًا آخر.", checking: "جاري التحقق من حسابك...", eyebrow: "مرج / الفريق", join: "انضم لفريق المتجر", signInCopy: "سجّل الدخول بالحساب الذي سيستخدمه الموظف، ثم راجع وقبل صلاحية الدعوة.", signIn: "تسجيل الدخول لقبول الدعوة", added: "تمت إضافة حسابك للفريق", active: "تم تفعيل صلاحيتك:", openDashboard: "فتح لوحة المتجر", invitation: "دعوة فريق المتجر", review: "سيتم تفعيل الصلاحية المحددة لك من صاحب المتجر. لا تمنح هذه الدعوة أي وصول للمدفوعات أو الإعدادات الحساسة.", accepting: "جاري قبول الدعوة...", accept: "قبول الدعوة",
  };
  const roleLabel = acceptedRole === "order_operator" ? (language === "en" ? "Order operations" : "متابعة الطلبات") : acceptedRole === "catalog_editor" ? (language === "en" ? "Catalog management" : "إدارة المنتجات") : acceptedRole === "analytics_viewer" ? (language === "en" ? "Analytics viewing" : "عرض التحليلات") : (language === "en" ? "Store manager" : "مدير المتجر");
  if (!token) return <main className="team-invite-page"><div className="team-invite-card"><Link2 size={30} /><h1>{labels.incomplete}</h1><p>{labels.request}</p></div></main>;
  if (loading) return <main className="team-invite-page"><div className="team-invite-card"><ShieldCheck size={30} /><p>{labels.checking}</p></div></main>;
  if (!user) return <main className="team-invite-page"><div className="team-invite-card"><UserRoundPlus size={30} /><p className="team-invite-eyebrow">{labels.eyebrow}</p><h1>{labels.join}</h1><p>{labels.signInCopy}</p><button className="admin-primary-action" onClick={beginLogin}>{labels.signIn}</button></div></main>;
  if (acceptedRole) return <main className="team-invite-page"><div className="team-invite-card"><CheckCircle2 size={34} /><h1>{labels.added}</h1><p>{labels.active} {roleLabel}. {language === "en" ? "Open the store dashboard to begin." : "افتح لوحة المتجر للبدء."}</p><button className="admin-primary-action" onClick={() => setLocation("/admin")}>{labels.openDashboard}</button></div></main>;
  return <main className="team-invite-page"><div className="team-invite-card"><ShieldCheck size={30} /><p className="team-invite-eyebrow">{labels.eyebrow}</p><h1>{labels.invitation}</h1><p>{labels.review}</p><button className="admin-primary-action" disabled={accept.isPending} onClick={() => accept.mutate({ token })}>{accept.isPending ? labels.accepting : labels.accept}</button>{accept.error ? <p className="team-invite-error">{accept.error.message}</p> : null}</div></main>;
}
