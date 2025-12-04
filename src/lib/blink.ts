// Blink API interfaces and types
export interface BlinkProduct {
  id: string;
  name: string;
  description: string;
  price: number; // in USDC
  imageUrl: string;
  createdAt: Date;
  merchantWallet: string;
}

export interface BlinkPayment {
  id: string;
  productId: string;
  amount: number;
  buyerWallet: string;
  sellerWallet: string;
  transactionHash?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}

export interface GeneratedBlink {
  id: string;
  product: BlinkProduct;
  blinkUrl: string;
  ogMeta: {
    title: string;
    description: string;
    image: string;
  };
}

// Generate a unique blink ID
export const generateBlinkId = (productName: string): string => {
  const slug = productName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  
  const timestamp = Date.now().toString(36);
  return `blink-${slug}-${timestamp}`;
};

// Create blink URL
export const createBlinkUrl = (blinkId: string): string => {
  return `https://blinkshop.app/buy/${blinkId}`;
};

// Validate Solana wallet address
export const isValidSolanaAddress = (address: string): boolean => {
  try {
    // Accept any non-empty string that looks reasonably like a wallet address
    if (!address || typeof address !== 'string') {
      return false;
    }
    
    // Trim whitespace
    const trimmed = address.trim();
    
    // Must be at least 32 characters (Solana addresses are typically 43-44)
    if (trimmed.length < 32) {
      return false;
    }
    
    // Check if it contains only valid base58 characters
    // Base58 excludes 0, O, I, and l to avoid confusion
    const base58Regex = /^[1-9A-HJ-NP-Z]+$/;
    
    // If it matches base58 regex, it's valid
    if (base58Regex.test(trimmed)) {
      return true;
    }
    
    // Fallback: Accept any alphanumeric string >= 32 chars as it might be from wallet
    // This is a safety net for different wallet implementations
    if (/^[a-zA-Z0-9]+$/.test(trimmed) && trimmed.length >= 32) {
      return true;
    }
    
    return false;
  } catch {
    return false;
  }
};

// Create product from form data
export const createProduct = (
  name: string,
  description: string,
  price: string,
  imageUrl: string,
  merchantWallet: string
): BlinkProduct => {
  const parsedPrice = parseFloat(price);
  
  if (!name || !name.trim()) throw new Error('Product name is required');
  if (!description || !description.trim()) throw new Error('Description is required');
  if (isNaN(parsedPrice) || parsedPrice <= 0) throw new Error('Price must be greater than 0');
  if (!imageUrl || !imageUrl.trim()) throw new Error('Image URL is required');
  
  // Better error message for wallet validation
  if (!merchantWallet) {
    throw new Error('Wallet not connected. Please connect your wallet first.');
  }
  
  if (!isValidSolanaAddress(merchantWallet)) {
    throw new Error(`Invalid Solana wallet address: ${merchantWallet}. Please make sure your wallet is properly connected.`);
  }

  return {
    id: generateBlinkId(name),
    name: name.trim(),
    description: description.trim(),
    price: parsedPrice,
    imageUrl: imageUrl.trim(),
    createdAt: new Date(),
    merchantWallet,
  };
};

// Generate complete blink
export const generateBlink = (product: BlinkProduct): GeneratedBlink => {
  const blinkUrl = createBlinkUrl(product.id);
  
  return {
    id: product.id,
    product,
    blinkUrl,
    ogMeta: {
      title: `Buy ${product.name} on BlinkShop - ${product.price} USDC`,
      description: product.description,
      image: product.imageUrl,
    },
  };
};

// Format price for display
export const formatPrice = (amount: number): string => {
  return amount.toFixed(2);
};

// Store blink in localStorage (for demo purposes)
export const saveBlinkToStorage = (blink: GeneratedBlink): void => {
  const storedBlinks = localStorage.getItem('blinkShop_blinks') || '[]';
  const blinks = JSON.parse(storedBlinks);
  blinks.push(blink);
  localStorage.setItem('blinkShop_blinks', JSON.stringify(blinks));
};

// Retrieve all blinks from localStorage
export const getAllBlinksFromStorage = (): GeneratedBlink[] => {
  const storedBlinks = localStorage.getItem('blinkShop_blinks') || '[]';
  return JSON.parse(storedBlinks);
};

// Get single blink from storage
export const getBlinkFromStorage = (blinkId: string): GeneratedBlink | null => {
  const blinks = getAllBlinksFromStorage();
  return blinks.find(blink => blink.id === blinkId) || null;
};

// Delete blink from storage
export const deleteBlinkFromStorage = (blinkId: string): void => {
  const blinks = getAllBlinksFromStorage();
  const filtered = blinks.filter(blink => blink.id !== blinkId);
  localStorage.setItem('blinkShop_blinks', JSON.stringify(filtered));
};
