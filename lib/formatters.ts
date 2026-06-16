// Format agent ID
export function formatAgentId(id: string): string {
  return `#PE-${id.slice(0, 5).toUpperCase()}`;
}

// Format currency
export function formatCurrency(
  amount: number | string,
  currency: string = "NGN"
): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return `${currency} ${amount}`;

  const symbols: Record<string, string> = {
    NGN: "₦",
    USD: "$",
    GBP: "£",
    EUR: "€",
    CAD: "C$",
    AUD: "A$",
    GHS: "GH₵",
    KES: "KSh",
    ZAR: "R",
    CNY: "¥",
    JPY: "¥",
  };

  const symbol = symbols[currency.toUpperCase()] || currency;
  const decimals = numAmount < 1 && numAmount > 0 ? 4 : 2;

  if (numAmount >= 1000000000) {
    return `${symbol}${(numAmount / 1000000000).toFixed(1)}B`;
  }
  if (numAmount >= 1000000) {
    return `${symbol}${(numAmount / 1000000).toFixed(1)}M`;
  }
  
  return `${symbol}${numAmount.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

// Format exchange rate
export function formatExchangeRate(rate: number | string, sendCurrency: string, receiveCurrency: string): string {
  const numRate = typeof rate === "string" ? parseFloat(rate) : rate;
  if (isNaN(numRate)) return `1 ${sendCurrency} = ${rate} ${receiveCurrency}`;
  
  // PapaEgo uses NGN as the base weak currency.
  // When sending NGN (e.g. NGN to EUR), the rate is defined as 1 EUR = X NGN.
  if (sendCurrency?.toUpperCase() === "NGN" && receiveCurrency?.toUpperCase() !== "NGN") {
    return `1 ${receiveCurrency} = ${numRate.toLocaleString(undefined, { maximumFractionDigits: 4 })} NGN`;
  }
  
  // In other cases (e.g. USD to NGN), the rate is 1 USD = X NGN.
  return `1 ${sendCurrency} = ${numRate.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${receiveCurrency}`;
}

// Format date
export function formatDate(date?: string | Date | null): string {
  if (!date) return "—";
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
