import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "PapaEgo Business",
    description: "Register and manage your business on PapaEgo — cross-border payments made simple."
};

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen font-sans" style={{ backgroundColor: "#F7F8F9" }}>
            {children}
        </div>
    );
}
