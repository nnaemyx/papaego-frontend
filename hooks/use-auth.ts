import { useAuthStore } from "@/store/auth-store";

export function useAuth() {
    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const logout = useAuthStore((state) => state.logout);
    const login = useAuthStore((state) => state.login);

    return { user, isAuthenticated, login, logout };
}
