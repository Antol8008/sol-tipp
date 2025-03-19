import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Gift, Coins, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createCommemorationTokenTipTransaction } from '@/lib/solana';

interface QuickTipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDonationComplete?: () => void;
}

export function QuickTipDialog({ open, onOpenChange, onDonationComplete }: QuickTipDialogProps) {
  const { connected, publicKey, signTransaction } = useWallet();
  const [recipientInput, setRecipientInput] = useState('');
  const [tipAmount, setTipAmount] = useState(0.1);
  const [comment, setComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [recipientProfile, setRecipientProfile] = useState<any>(null);
  const [isWalletAddress, setIsWalletAddress] = useState(false);
  const [mintedNftAddress, setMintedNftAddress] = useState<string | null>(null);

  const quickOptions = [
    { amount: 0.1, label: '🎯 Quick' },
    { amount: 0.2, label: '🚀 Double' },
    { amount: 0.5, label: '🌟 Premium' },
  ];

  const isValidSolanaAddress = (address: string) => {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  };

  const handleRecipientInputBlur = async () => {
    if (!recipientInput) return;
    
    // Check if input is a Solana wallet address
    if (isValidSolanaAddress(recipientInput)) {
      setIsWalletAddress(true);
      setRecipientProfile({
        walletAddress: recipientInput,
        displayName: `${recipientInput.slice(0, 4)}...${recipientInput.slice(-4)}`,
        username: recipientInput.slice(0, 8),
        minimumTip: 0.01
      });
      return;
    }

    setIsWalletAddress(false);
    
    try {
      const response = await fetch(`/api/profiles/${recipientInput}`);
      if (response.ok) {
        const profile = await response.json();
        setRecipientProfile(profile);
        if (profile.minimumTip > tipAmount) {
          setTipAmount(profile.minimumTip);
        }
      } else {
        setRecipientProfile(null);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setRecipientProfile(null);
    }
  };

  const resetForm = () => {
    setRecipientInput('');
    setComment('');
    setTipAmount(0.1);
    setRecipientProfile(null);
    setIsWalletAddress(false);
  };

  const handleSendTip = async () => {
    if (!connected || !publicKey || !signTransaction || !recipientProfile) {
      toast.error('Please connect your wallet and enter a valid recipient');
      return;
    }

    if (!isWalletAddress && tipAmount < (recipientProfile.minimumTip || 0)) {
      toast.error(`Minimum tip amount is ${recipientProfile.minimumTip} SOL`);
      return;
    }

    setIsProcessing(true);
    try {
      const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL!);
      
      // Create transaction for SOL tip with commemorative token
      const { transaction, mintKeypair } = await createCommemorationTokenTipTransaction(
        connection,
        tipAmount,
        publicKey,
        new PublicKey(recipientProfile.walletAddress),
        comment
      );

      console.log("Commemorative token address:", mintKeypair.publicKey.toString());
      
      // The mint keypair must sign first
      transaction.partialSign(mintKeypair);
      
      // Then the user's wallet signs
      const signedTx = await signTransaction(transaction);
      const txSignature = await connection.sendRawTransaction(signedTx.serialize());

      // Wait for confirmation
      await connection.confirmTransaction({
        signature: txSignature,
        blockhash: transaction.recentBlockhash!,
        lastValidBlockHeight: transaction.lastValidBlockHeight!,
      });

      // Create donation record
      const response = await fetch(`/api/profiles/${isWalletAddress ? recipientProfile.walletAddress : recipientInput}/donations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: tipAmount,
          comment,
          signature: txSignature,
          walletAddress: publicKey.toString(),
          recipientWallet: recipientProfile.walletAddress,
          isDirectWalletTip: isWalletAddress,
          tipType: 'sol'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to record donation');
      }

      // Set the minted NFT address for display
      setMintedNftAddress(mintKeypair.publicKey.toString());
      toast.success(`Tip sent successfully! 🎉`);
      onDonationComplete?.();
    } catch (error: any) {
      console.error('Error sending tip:', error);
      toast.error(error.message || 'Failed to send tip. Please try again.');
      setMintedNftAddress(null);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) {
        resetForm();
        setMintedNftAddress(null);
      }
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-2">Quick Tip</DialogTitle>
          <DialogDescription className="text-gray-600">
            Send a tip to any creator by entering their username or wallet address
          </DialogDescription>
        </DialogHeader>
        
        {mintedNftAddress ? (
          <div className="py-4 space-y-6">
            <div className="bg-green-50 border border-green-100 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-green-800 mb-1">Tip Sent Successfully!</h3>
              <p className="text-sm text-green-700 mb-4">
                Your tip of {tipAmount} SOL has been sent to {recipientProfile?.displayName || recipientProfile?.username || recipientInput}.
              </p>
              
              <div className="bg-white rounded-lg border border-green-200 p-4 mb-4">
                <h4 className="text-sm font-medium text-green-800 mb-2 flex items-center">
                  <Gift className="mr-2 h-4 w-4" />
                  NFT Comment Card Minted
                </h4>
                <p className="text-xs text-green-700 mb-3">
                  Your comment has been immortalized as an NFT in the recipient's wallet.
                </p>
                <div className="flex flex-col space-y-2">
                  <div className="text-xs font-mono bg-gray-50 p-2 rounded border border-green-100 break-all">
                    {mintedNftAddress}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-8 w-full flex items-center justify-center"
                    onClick={() => window.open(`https://solscan.io/token/${mintedNftAddress}`, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View on Solscan
                  </Button>
                </div>
              </div>
              
              <Button 
                onClick={() => {
                  resetForm();
                  setMintedNftAddress(null);
                }}
                className="w-full bg-[#00E64D] hover:bg-[#00CC44] text-[#0F1611] rounded-full h-12"
              >
                Send Another Tip
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Recipient</label>
              <Input
                value={recipientInput}
                onChange={(e) => setRecipientInput(e.target.value)}
                onBlur={handleRecipientInputBlur}
                className="rounded-full"
                placeholder="Enter username or wallet address"
              />
              {recipientProfile && (
                <p className="text-sm text-green-600">
                  {isWalletAddress ? (
                    <>Found wallet: {recipientProfile.displayName}</>
                  ) : (
                    <>Found: {recipientProfile.displayName} (@{recipientProfile.username})</>
                  )}
                </p>
              )}
            </div>
            
            <div>
              <div className="grid grid-cols-3 gap-4">
                {quickOptions.map((option, index) => (
                  <Button
                    key={index}
                    variant={tipAmount === option.amount ? "default" : "outline"}
                    className={`h-24 rounded-xl flex flex-col items-center justify-center space-y-2 ${
                      index === 0 ? 'border-[#00E64D] border-2' : ''
                    }`}
                    onClick={() => setTipAmount(option.amount)}
                  >
                    <span className="text-2xl">{option.amount} SOL</span>
                    <span className="text-sm">{option.label}</span>
                  </Button>
                ))}
              </div>
              
              <div className="space-y-2 mt-4">
                <label className="text-sm font-medium">Custom Amount (SOL)</label>
                <Input
                  type="number"
                  step="0.01"
                  min={!isWalletAddress ? (recipientProfile?.minimumTip || 0) : 0.01}
                  value={tipAmount}
                  onChange={(e) => setTipAmount(parseFloat(e.target.value))}
                  className="rounded-full"
                  placeholder="Enter custom amount"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center justify-between">
                <span>Add a Comment (Optional)</span>
                <span className="text-xs text-indigo-600 flex items-center">
                  <Gift className="w-3 h-3 mr-1" />
                  Will be minted as an NFT!
                </span>
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="rounded-xl min-h-[80px]"
                placeholder="Your comment will be immortalized as an NFT to the recipient..."
              />
              <p className="text-xs text-gray-500">
                Your comment will be permanently stored on-chain as an NFT sent to the recipient.
              </p>
            </div>
            
            
            <Button
              className="w-full bg-[#00E64D] hover:bg-[#00CC44] text-[#0F1611] rounded-full h-12"
              onClick={handleSendTip}
              disabled={
                isProcessing || 
                !recipientProfile || 
                (!isWalletAddress && tipAmount < (recipientProfile?.minimumTip || 0))
              }
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                `Send ${tipAmount} SOL Tip`
              )}
            </Button>
            <p className="text-xs text-gray-500 text-center">
              A platform fee of 0.01 SOL + 3% will be charged
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 