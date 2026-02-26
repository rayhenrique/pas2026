import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useAuth } from '../useAuth';

// Mock do supabase
const mockOnAuthStateChange = vi.fn();
const mockGetSession = vi.fn();
const mockSignOut = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
    supabase: {
        auth: {
            onAuthStateChange: (...args: unknown[]) => mockOnAuthStateChange(...args),
            getSession: () => mockGetSession(),
            signOut: () => mockSignOut(),
        },
    },
}));

describe('useAuth', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockOnAuthStateChange.mockReturnValue({
            data: { subscription: { unsubscribe: vi.fn() } },
        });
        mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
        mockSignOut.mockResolvedValue({ error: null });
    });

    it('deve iniciar com loading true', () => {
        const { result } = renderHook(() => useAuth());
        expect(result.current.loading).toBe(true);
    });

    it('deve retornar user null quando não há sessão', async () => {
        mockGetSession.mockResolvedValue({ data: { session: null }, error: null });

        const { result } = renderHook(() => useAuth());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
    });

    it('deve retornar user quando há sessão ativa', async () => {
        const mockUser = { id: 'user-123', email: 'test@example.com' };
        const mockSession = { user: mockUser };

        mockGetSession.mockResolvedValue({ data: { session: mockSession }, error: null });

        const { result } = renderHook(() => useAuth());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.user).toEqual(mockUser);
        expect(result.current.isAuthenticated).toBe(true);
    });

    it('deve chamar signOut do supabase', async () => {
        const { result } = renderHook(() => useAuth());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        await act(async () => {
            await result.current.signOut();
        });

        expect(mockSignOut).toHaveBeenCalled();
    });

    it('deve configurar listener de auth state change', () => {
        renderHook(() => useAuth());

        expect(mockOnAuthStateChange).toHaveBeenCalled();
    });

    it('deve limpar subscription ao desmontar', () => {
        const mockUnsubscribe = vi.fn();
        mockOnAuthStateChange.mockReturnValue({
            data: { subscription: { unsubscribe: mockUnsubscribe } },
        });

        const { unmount } = renderHook(() => useAuth());
        unmount();

        expect(mockUnsubscribe).toHaveBeenCalled();
    });
});
