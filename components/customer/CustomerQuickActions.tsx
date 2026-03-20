"use client";

import Link from "next/link";
import { Plus, Wallet, TrendingUp, MessageCircle, LucideIcon } from "lucide-react";

type GradientKey = "green" | "blue" | "pink" | "yellow";

const gradientStyles: Record<GradientKey, { background: string; textColor: string }> = {
  green:  { background: "var(--gradient-green)",  textColor: "var(--action-green-text)" },
  blue:   { background: "var(--gradient-blue)",   textColor: "var(--action-blue-text)" },
  pink:   { background: "var(--gradient-pink)",   textColor: "var(--action-pink-text)" },
  yellow: { background: "var(--gradient-yellow)", textColor: "var(--action-yellow-text)" },
};

interface Action {
  label: string;
  icon: LucideIcon;
  gradient: GradientKey;
  href?: string;
  onClick?: () => void;
}

interface CustomerQuickActionsProps {
  onNewTrade: () => void;
}

export function CustomerQuickActions({ onNewTrade }: CustomerQuickActionsProps) {
  const actions: Action[] = [
    { label: "New Transaction", icon: Plus,          gradient: "green",  onClick: onNewTrade },
    { label: "View All Trades", icon: Wallet,        gradient: "blue",   href: "/customer/trades" },
    { label: "Exchange Rates",  icon: TrendingUp,    gradient: "yellow", href: "/customer/rates" },
    { label: "Need Help?",      icon: MessageCircle, gradient: "pink",   href: "mailto:support@papaego.com" },
  ];

  return (
    <div>
      <h2 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          const { background, textColor } = gradientStyles[action.gradient];

          const inner = (
            <div
              className="rounded-xl py-5 px-4 shadow-[0px_10px_30px_rgba(206,206,206,0.25),inset_0px_8px_16px_rgba(0,0,0,0.12)] transition-transform hover:scale-[1.02] flex flex-col h-32"
              style={{ background }}
            >
              <div className="flex-1 flex items-start">
                <div
                  className="w-11 h-11 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "rgba(255,255,255,0.55)" }}
                >
                  <Icon className="w-5 h-5" style={{ color: textColor }} />
                </div>
              </div>
              <p
                className="text-sm font-black text-right leading-tight"
                style={{ color: textColor }}
              >
                {action.label}
              </p>
            </div>
          );

          if (action.href) {
            return (
              <Link key={action.label} href={action.href}>
                {inner}
              </Link>
            );
          }

          return (
            <button key={action.label} onClick={action.onClick} className="text-left">
              {inner}
            </button>
          );
        })}
      </div>
    </div>
  );
}
