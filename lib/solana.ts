import { PublicKey, Transaction, Connection, LAMPORTS_PER_SOL, SystemProgram } from '@solana/web3.js';

export const PLATFORM_FEE_PERCENT = 3;
export const PLATFORM_FEE_FIXED = 0.001; // Fixed platform fee in SOL
export const PLATFORM_FEE_ACCOUNT = new PublicKey('7pDCLJpmLRbrxoA25YSPh8eMNFvBiKnLNjMCambmdXvG');

export async function calculatePlatformFee(amount: number): Promise<number> {
  return (amount * PLATFORM_FEE_PERCENT) / 100 + PLATFORM_FEE_FIXED;
}

export async function createTipTransaction(
  connection: Connection,
  tipAmount: number,
  fromPubkey: PublicKey,
  toPubkey: PublicKey,
): Promise<Transaction> {
  // Create transaction and set fee payer
  const transaction = new Transaction();
  transaction.feePayer = fromPubkey;
  
  // Calculate platform fee (percentage + fixed fee)
  const platformFee = await calculatePlatformFee(tipAmount);
  const creatorAmount = tipAmount - (platformFee - PLATFORM_FEE_FIXED); // Subtract only the percentage fee from tip
  
  // Convert SOL to lamports, ensuring integer values
  const creatorLamports = Math.floor(creatorAmount * LAMPORTS_PER_SOL);
  const platformFeeLamports = Math.floor(platformFee * LAMPORTS_PER_SOL);
  
  // Add transfer instruction for creator
  transaction.add(
    SystemProgram.transfer({
      fromPubkey,
      toPubkey,
      lamports: creatorLamports,
    })
  );
  
  // Add transfer instruction for platform fee
  transaction.add(
    SystemProgram.transfer({
      fromPubkey,
      toPubkey: PLATFORM_FEE_ACCOUNT,
      lamports: platformFeeLamports,
    })
  );

  // Get the latest blockhash
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.lastValidBlockHeight = lastValidBlockHeight;
  
  return transaction;
}