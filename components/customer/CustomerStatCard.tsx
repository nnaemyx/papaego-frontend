import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface CustomerStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  description?: string;
  href?: string;
  loading?: boolean;
}

export function CustomerStatCard({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  description,
  href,
  loading,
}: CustomerStatCardProps) {
  const inner = (
    <div
      className="rounded-xl border bg-white p-5 shadow-[0px_10px_30px_rgba(206,206,206,0.25)] h-full"
      style={{ borderColor: "var(--border-custom)" }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: iconBg }}
        >
          <Icon className="w-5 h-5" style={{ color: iconColor }} />
        </div>
        {loading ? (
          <div className="h-8 w-14 rounded animate-pulse bg-gray-200" />
        ) : (
          <span className="text-2xl font-bold" style={{ color: iconColor }}>
            {value}
          </span>
        )}
      </div>
      <p className="heading-card mb-1">{title}</p>
      {description && <p className="body-secondary">{description}</p>}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block hover:opacity-90 transition-opacity">
        {inner}
      </Link>
    );
  }

  return inner;
}
