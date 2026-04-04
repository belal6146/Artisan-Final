import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getArtworks, getArtworkById } from '@/backend/actions/artwork';
import { recordTransaction } from '@/backend/actions/transaction';
import * as firestore from 'firebase/firestore';

// Mock Firebase Firestore completely for this file
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(() => ({})),
  doc: vi.fn(() => ({})),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
}));

describe('Artworks DB Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch artworks with correct query constraints', async () => {
        const mockDocs = {
            docs: [
                { id: '1', data: () => ({ title: 'Artwork A', createdAt: '2023-01-01', status: 'available' }) },
            ]
        };
        vi.mocked(firestore.getDocs).mockResolvedValueOnce(mockDocs as any);

        const result = await getArtworks();

        expect(firestore.query).toHaveBeenCalled();
        expect(firestore.where).toHaveBeenCalledWith("status", "==", "available");
        expect(firestore.orderBy).toHaveBeenCalledWith("createdAt", "desc");
        expect(result.length).toBe(1);
    });

    it('should fetch a single artwork by ID correctly', async () => {
        const mockSnap = {
            exists: () => true,
            id: 'artwork_123',
            data: () => ({ title: 'Unique Artwork' })
        };
        vi.mocked(firestore.getDoc).mockResolvedValueOnce(mockSnap as any);

        const result = await getArtworkById('artwork_123');

        expect(result).toEqual({ id: 'artwork_123', title: 'Unique Artwork' });
    });

    it('should return undefined if the artwork does not exist', async () => {
        vi.mocked(firestore.getDoc).mockResolvedValueOnce({
            exists: () => false
        } as any);

        const result = await getArtworkById('non_existent');
        expect(result).toBeUndefined();
    });
});

describe('Transaction Action', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should record a transaction successfully', async () => {
        vi.mocked(firestore.addDoc).mockResolvedValueOnce({ id: 'trans_1' } as any);

        const result = await recordTransaction('user_123', {
            type: 'buy',
            itemId: 'item_1',
            itemTitle: 'Test Item',
            amount: 50,
            currency: 'EUR'
        });

        expect(result.success).toBe(true);
        expect(firestore.addDoc).toHaveBeenCalled();
    });

    it('should throw error if uid is missing', async () => {
        await expect(recordTransaction('', {} as any)).rejects.toThrow("User ID is required");
    });
});
