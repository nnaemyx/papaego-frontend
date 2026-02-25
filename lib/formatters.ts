// Format agent ID
export function formatAgentId(id: string): string {
  return `#PE-${id.slice(0, 5).toUpperCase()}`;
}

// Format currency
export function formatCurrency(
  amount: number,
  currency: string = "NGN"
): string {
  const symbol = currency === "NGN" ? "₦" : "$";
  
  // Format large numbers with K, M, B
  if (amount >= 1000000000) {
    return `${symbol}${(amount / 1000000000).toFixed(1)}B`;
  }
  if (amount >= 1000000) {
    return `${symbol}${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${symbol}${(amount / 1000).toFixed(1)}K`;
  }
  
  return `${symbol}${amount.toLocaleString()}`;
}

// Format date
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Format time
export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// Get status color
export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    Active: "bg-green-100 text-green-700 border-green-300",
    Inactive: "bg-gray-100 text-gray-700 border-gray-300",
    "Pending Verification": "bg-yellow-100 text-yellow-700 border-yellow-300",
    Suspended: "bg-red-100 text-red-700 border-red-300",
    Flagged: "bg-red-100 text-red-700 border-red-300",
    Completed: "bg-green-100 text-green-700 border-green-300",
    "In Progress": "bg-blue-100 text-blue-700 border-blue-300",
    Pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
    Cancelled: "bg-red-100 text-red-700 border-red-300",
    Failed: "bg-red-100 text-red-700 border-red-300",
  };

  return statusColors[status] || "bg-gray-100 text-gray-700 border-gray-300";
}

// Format percentage change
export function formatPercentageChange(value: number): {
  text: string;
  color: string;
  isPositive: boolean;
} {
  const isPositive = value >= 0;
  return {
    text: `${isPositive ? "+" : ""}${value.toFixed(1)}%`,
    color: isPositive ? "text-green-600" : "text-red-600",
    isPositive,
  };
}

// Format duration
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
}
