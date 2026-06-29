import {
  BarChart3,
  Bell,
  Briefcase,
  Building2,
  FileText,
  GraduationCap,
  History,
  LayoutDashboard,
  Mail,
  Send,
  Settings,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

/** Primary navigation, grouped for readability in the sidebar. */
export const navGroups: NavGroup[] = [
  {
    label: "Pilotage",
    items: [
      { label: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
      { label: "Statistiques", href: "/stats", icon: BarChart3 },
    ],
  },
  {
    label: "Recherche",
    items: [
      { label: "Offres", href: "/offers", icon: Briefcase },
      { label: "Entreprises", href: "/companies", icon: Building2 },
      { label: "Recruteurs", href: "/recruiters", icon: Users },
    ],
  },
  {
    label: "Suivi",
    items: [
      { label: "Candidatures", href: "/applications", icon: Send },
      { label: "Documents", href: "/documents", icon: FileText },
      { label: "E-mails", href: "/emails", icon: Mail },
      { label: "Entretiens", href: "/interviews", icon: GraduationCap },
    ],
  },
  {
    label: "Système",
    items: [
      { label: "Contrôle qualité", href: "/quality", icon: ShieldCheck },
      { label: "Notifications", href: "/notifications", icon: Bell },
      { label: "Historique", href: "/history", icon: History },
      { label: "Configuration", href: "/settings", icon: Settings },
    ],
  },
];
