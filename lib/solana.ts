import { PublicKey, Transaction, Connection, LAMPORTS_PER_SOL, SystemProgram, Keypair, ComputeBudgetProgram } from '@solana/web3.js';
import {
  createTransferInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  createInitializeMintInstruction,
  createMintToInstruction,
  createSetAuthorityInstruction,
  AuthorityType,
  MINT_SIZE,
  getMinimumBalanceForRentExemptMint
} from '@solana/spl-token';
import {
  PROGRAM_ID,
  createCreateMetadataAccountV3Instruction
} from '@metaplex-foundation/mpl-token-metadata';
import UploadFileToBlockChain from './uploadToArweave';

export const PLATFORM_FEE_PERCENT = 3;
export const PLATFORM_FEE_FIXED = 0.001;
export const PLATFORM_FEE_ACCOUNT = new PublicKey('6Uzye3LFwsDwB72uuMAdqHmtH6fvuNnGLFVVdQPgJGAH');

export async function calculatePlatformFee(amount: number): Promise<number> {
  return (amount * PLATFORM_FEE_PERCENT) / 100 + PLATFORM_FEE_FIXED;
}

export async function createTipTransaction(
  connection: Connection,
  tipAmount: number,
  fromPubkey: PublicKey,
  toPubkey: PublicKey,
): Promise<Transaction> {
  const transaction = new Transaction();
  transaction.feePayer = fromPubkey;


  const platformFee = await calculatePlatformFee(tipAmount);
  const creatorAmount = tipAmount - (platformFee - PLATFORM_FEE_FIXED);

  const creatorLamports = Math.floor(creatorAmount * LAMPORTS_PER_SOL);
  const platformFeeLamports = Math.floor(platformFee * LAMPORTS_PER_SOL);



  transaction.add(
    SystemProgram.transfer({
      fromPubkey,
      toPubkey,
      lamports: creatorLamports,
    })
  );

  transaction.add(
    SystemProgram.transfer({
      fromPubkey,
      toPubkey: PLATFORM_FEE_ACCOUNT,
      lamports: platformFeeLamports,
    })
  );

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.lastValidBlockHeight = lastValidBlockHeight;

  return transaction;
}


export async function createCommemorationTokenTipTransaction(
  connection: Connection,
  tipAmount: number,
  fromPubkey: PublicKey,
  toPubkey: PublicKey,
  tipMessage: string = "Thank you for your content!",
): Promise<{ transaction: Transaction; mintKeypair: Keypair }> {
  const transaction = new Transaction();
  transaction.feePayer = fromPubkey;

  // Generate a new keypair for the commemorative token mint
  const mintKeypair = Keypair.generate();

  const tokenDecimals = 0;
  const tokenSymbol = "TIPP";

  // Format the comment for use in token name, truncate if too long
  const truncatedComment = tipMessage.length > 30
    ? `${tipMessage.substring(0, 27)}...`
    : tipMessage;

  // Use the tip comment in the token name
  const tokenName = `Tip from ${fromPubkey.toString().substring(0, 4)}`;

  const platformFee = await calculatePlatformFee(tipAmount);
  const creatorAmount = tipAmount - (platformFee - PLATFORM_FEE_FIXED);
  const creatorLamports = Math.floor(creatorAmount * LAMPORTS_PER_SOL);
  const platformFeeLamports = Math.floor(platformFee * LAMPORTS_PER_SOL);

  const priorityFeeInstruction = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: 1_000_000,
  });

  const addComputeUnitsInstruction = ComputeBudgetProgram.setComputeUnitLimit({
    units: 1_400_000,
  });

  // Calculate minimum lamports needed for the mint
  const lamports = await getMinimumBalanceForRentExemptMint(connection);

  // Get the recipient's associated token account for the new token
  const recipientTokenATA = getAssociatedTokenAddressSync(
    mintKeypair.publicKey,
    toPubkey
  );

  // Create metadata PDA address
  const metadataPDA = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      PROGRAM_ID.toBuffer(),
      mintKeypair.publicKey.toBuffer(),
    ],
    PROGRAM_ID
  )[0];

  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD


  const nftImageUrl = `https://ar-io.net/dXc2XoyoViwGG25MpzdWmPF5E_CQoH8DOScmVUbL-p0`;
  const metadataJson = {
    name: tokenName,
    symbol: tokenSymbol,
    description: `Tip NFT from ${fromPubkey.toString().substring(0, 8)} to ${toPubkey.toString().substring(0, 8)} on ${formattedDate}. Amount: ${tipAmount} SOL`,
    image: nftImageUrl,
    attributes: [
      {
        trait_type: "Sender",
        value: fromPubkey.toString()
      },
      {
        trait_type: "Recipient",
        value: toPubkey.toString()
      },
      {
        trait_type: "Amount",
        value: tipAmount.toString()
      },
      {
        trait_type: "Date",
        value: formattedDate
      },
      {
        trait_type: "Comment",
        value: tipMessage
      }
    ]
  };

  const metadataBlob = new Blob([JSON.stringify(metadataJson)], {
    type: "application/json",
  });
  const metadataUrl = await UploadFileToBlockChain(metadataBlob);

  const metadataInstruction = createCreateMetadataAccountV3Instruction(
    {
      metadata: metadataPDA,
      mint: mintKeypair.publicKey,
      mintAuthority: fromPubkey,
      payer: fromPubkey,
      updateAuthority: fromPubkey,
    },
    {
      createMetadataAccountArgsV3: {
        data: {
          name: tokenName,
          symbol: tokenSymbol,
          uri: metadataUrl!,
          creators: [
            {
              address: fromPubkey,
              verified: true,
              share: 100,
            },
          ],
          sellerFeeBasisPoints: 0, 
          collection: null,
          uses: null,
        },
        isMutable: false,
        collectionDetails: null,
      },
    }
  );

  const createAccountInstruction = SystemProgram.createAccount({
    fromPubkey,
    newAccountPubkey: mintKeypair.publicKey,
    space: MINT_SIZE,
    lamports,
    programId: TOKEN_PROGRAM_ID,
  });

  // Initialize mint - requires mint authority signature
  const initMintInstruction = createInitializeMintInstruction(
    mintKeypair.publicKey,
    tokenDecimals,
    fromPubkey,
    fromPubkey,
    TOKEN_PROGRAM_ID
  );

  // Create the recipient's associated token account
  const createATAInstruction = createAssociatedTokenAccountInstruction(
    fromPubkey,
    recipientTokenATA,
    toPubkey,
    mintKeypair.publicKey
  );

  // Mint exactly 1 token to recipient - requires mint authority signature
  const mintToInstruction = createMintToInstruction(
    mintKeypair.publicKey,
    recipientTokenATA,
    fromPubkey,
    1, // Mint exactly 1 token for NFT
    [],
    TOKEN_PROGRAM_ID
  );

  // Disable mint authority - requires mint authority signature
  const disableMintInstruction = createSetAuthorityInstruction(
    mintKeypair.publicKey,
    fromPubkey,
    AuthorityType.MintTokens,
    null,
    [],
    TOKEN_PROGRAM_ID
  );

  // Add all instructions to the transaction
  transaction.add(
    // Add priority fee and compute units instructions first
    priorityFeeInstruction,
    addComputeUnitsInstruction,

    // Create SOL transfer for the actual tip
    SystemProgram.transfer({
      fromPubkey,
      toPubkey,
      lamports: creatorLamports,
    }),

    // Add platform fee transfer
    SystemProgram.transfer({
      fromPubkey,
      toPubkey: PLATFORM_FEE_ACCOUNT,
      lamports: platformFeeLamports,
    }),

    // Create mint account (requires mintKeypair to sign)
    createAccountInstruction,

    // Initialize mint
    initMintInstruction,

    // Create associated token account for recipient
    createATAInstruction,

    // Mint exactly 1 token to recipient
    mintToInstruction,

    // Add metadata
    metadataInstruction,

    // Disable mint authority
    disableMintInstruction
  );

  // Get the latest blockhash
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.lastValidBlockHeight = lastValidBlockHeight;

  return { transaction, mintKeypair };
}

