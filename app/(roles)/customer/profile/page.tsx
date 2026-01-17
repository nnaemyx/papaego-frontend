import KycForm from "@/components/features/customer/kyc-form";

export default function CustomerProfilePage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">Profile & KYC</h1>
            <div className="max-w-xl">
                <KycForm />
            </div>
        </div>
    );
}
