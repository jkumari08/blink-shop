import { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  createProduct,
  generateBlink,
  saveBlinkToStorage,
  getAllBlinksFromStorage,
  getBlinkFromStorage,
  deleteBlinkFromStorage,
  isValidSolanaAddress,
  type BlinkProduct,
  type GeneratedBlink,
} from '@/lib/blink';

export const useBlinkManagement = () => {
  const { publicKey } = useWallet();
  const [blinks, setBlinks] = useState<GeneratedBlink[]>(() =>
    getAllBlinksFromStorage()
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a new blink
  const createNewBlink = useCallback(
    async (
      name: string,
      description: string,
      price: string,
      imageUrl: string
    ): Promise<GeneratedBlink | null> => {
      setLoading(true);
      setError(null);

      try {
        // Validate wallet is connected
        if (!publicKey) {
          throw new Error('Please connect your wallet first');
        }

        const merchantWallet = publicKey.toString();
        
        // Debug logging
        console.log('Creating blink with wallet:', merchantWallet);
        console.log('Wallet length:', merchantWallet.length);

        // Create product with validation
        const product = createProduct(name, description, price, imageUrl, merchantWallet);

        // Generate blink
        const newBlink = generateBlink(product);

        // Save to storage
        saveBlinkToStorage(newBlink);

        // Update state
        setBlinks(prev => [newBlink, ...prev]);

        return newBlink;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create blink';
        console.error('Error creating blink:', errorMessage);
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [publicKey]
  );

  // Get all blinks for current merchant
  const getMyBlinks = useCallback(() => {
    if (!publicKey) return [];
    const allBlinks = getAllBlinksFromStorage();
    return allBlinks.filter(
      blink => blink.product.merchantWallet === publicKey.toString()
    );
  }, [publicKey]);

  // Get single blink
  const getBlink = useCallback((blinkId: string) => {
    return getBlinkFromStorage(blinkId);
  }, []);

  // Delete a blink
  const deleteBlink = useCallback((blinkId: string) => {
    try {
      deleteBlinkFromStorage(blinkId);
      setBlinks(prev => prev.filter(b => b.id !== blinkId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete blink';
      setError(errorMessage);
    }
  }, []);

  return {
    blinks,
    loading,
    error,
    createNewBlink,
    getMyBlinks,
    getBlink,
    deleteBlink,
  };
};
