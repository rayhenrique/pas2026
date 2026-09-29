import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary, withErrorBoundary } from '../ErrorBoundary';

// Componente que lança erro para testes
const ThrowError = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
    if (shouldThrow) {
        throw new Error('Test error message');
    }
    return <div>No error</div>;
};

// Suprimir console.error durante testes de erro
const originalError = console.error;

beforeEach(() => {
    console.error = vi.fn();
});

afterEach(() => {
    console.error = originalError;
});

describe('ErrorBoundary', () => {
    it('deve renderizar children quando não há erro', () => {
        render(
            <ErrorBoundary>
                <div>Content works</div>
            </ErrorBoundary>
        );

        expect(screen.getByText('Content works')).toBeInTheDocument();
    });

    it('deve mostrar UI de erro quando componente filho lança erro', () => {
        render(
            <ErrorBoundary>
                <ThrowError />
            </ErrorBoundary>
        );

        expect(screen.getByText('Ops! Algo deu errado')).toBeInTheDocument();
        expect(screen.getByText(/Ocorreu um erro inesperado/)).toBeInTheDocument();
    });

    it('deve mostrar botões de ação na UI de erro', () => {
        render(
            <ErrorBoundary>
                <ThrowError />
            </ErrorBoundary>
        );

        expect(screen.getByText('Tentar Novamente')).toBeInTheDocument();
        expect(screen.getByText('Ir para Dashboard')).toBeInTheDocument();
    });

    it('deve usar fallback customizado quando fornecido', () => {
        const customFallback = <div>Custom error UI</div>;

        render(
            <ErrorBoundary fallback={customFallback}>
                <ThrowError />
            </ErrorBoundary>
        );

        expect(screen.getByText('Custom error UI')).toBeInTheDocument();
        expect(screen.queryByText('Ops! Algo deu errado')).not.toBeInTheDocument();
    });
});

describe('withErrorBoundary HOC', () => {
    it('deve envolver componente com ErrorBoundary', () => {
        const SimpleComponent = () => <div>Simple content</div>;
        const WrappedComponent = withErrorBoundary(SimpleComponent);

        render(<WrappedComponent />);

        expect(screen.getByText('Simple content')).toBeInTheDocument();
    });

    it('deve capturar erros do componente envolvido', () => {
        const ErrorComponent = () => {
            throw new Error('HOC test error');
        };
        const WrappedComponent = withErrorBoundary(ErrorComponent);

        render(<WrappedComponent />);

        expect(screen.getByText('Ops! Algo deu errado')).toBeInTheDocument();
    });

    it('deve usar fallback customizado no HOC', () => {
        const ErrorComponent = () => {
            throw new Error('HOC test error');
        };
        const customFallback = <div>HOC custom fallback</div>;
        const WrappedComponent = withErrorBoundary(ErrorComponent, customFallback);

        render(<WrappedComponent />);

        expect(screen.getByText('HOC custom fallback')).toBeInTheDocument();
    });
});
