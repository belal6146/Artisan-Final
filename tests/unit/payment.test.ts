import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaymentService } from '@/backend/services/payment';
import { mockStripeCreate } from '../setup';

describe('PaymentService', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should create a payment session (PaymentIntent) successfully', async () => {
        const mockPI = { id: 'pi_123', client_secret: 'secret_123' };
        mockStripeCreate.mockResolvedValueOnce(mockPI);

        const result = await PaymentService.createSession({
            id: 'artwork_1',
            title: 'Test Artwork',
            price: 100,
            currency: 'EUR'
        });

        expect(result).toEqual({ id: 'pi_123', clientSecret: 'secret_123' });
        expect(mockStripeCreate).toHaveBeenCalledWith(expect.objectContaining({
            amount: 10000,
            currency: 'eur',
            metadata: {
                itemId: 'artwork_1',
                itemTitle: 'Test Artwork'
            }
        }));
    });

    it('should process a direct payment successfully', async () => {
        const mockPI = { status: 'succeeded', id: 'pi_456' };
        mockStripeCreate.mockResolvedValueOnce(mockPI);

        const result = await PaymentService.processPayment(50, 'USD', 'pm_test');

        expect(result).toEqual({
            success: true,
            transactionId: 'pi_456',
            timestamp: expect.any(String)
        });
        expect(mockStripeCreate).toHaveBeenCalledWith(expect.objectContaining({
            amount: 5000,
            currency: 'usd',
            payment_method: 'pm_test',
            confirm: true
        }));
    });

    it('should handle Stripe errors gracefully in processPayment', async () => {
        mockStripeCreate.mockRejectedValueOnce(new Error('Stripe declined'));

        const result = await PaymentService.processPayment(50, 'USD', 'pm_fail');

        expect(result.success).toBe(false);
        expect(result.error).toBe('Stripe declined');
    });
});
