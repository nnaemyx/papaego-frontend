import api from "./client";

export const bankApi = {
    /**
     * Verify a bank account's name
     */
    verifyAccount: async (bankName: string, accountNumber: string) => {
        const response = await api.post("/bank/verify", { bankName, accountNumber });
        return response.data as {
            success: true;
            accountName: string;
            bankName: string;
            accountNumber: string;
            status: "VERIFIED";
        };
    }
};
