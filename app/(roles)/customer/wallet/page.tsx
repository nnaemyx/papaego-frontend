import { WalletPanel } from "@/components/customer/WalletPanel";

export const metadata = {
    title: "Wallet | Papa Ego",
    description: "Fund your wallet and track balances used for supplier payments.",
};

export default function CustomerWalletPage() {
    return (
        <div className="mx-auto max-w-5xl px-4 py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Wallet</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Fund your wallet to pay suppliers. Trades can only be submitted when your
                    available balance covers the amount.
                </p>
            </div>
            <WalletPanel />
        </div>
    );
}
