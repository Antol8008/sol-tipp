import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Gift } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createTipTransaction } from '@/lib/solana';

interface QuickTipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickTipDialog({ open, onOpenChange }: QuickTipDialogProps) {
  const { connected, publicKey, signTransaction } = useWallet();
  const [recipientInput, setRecipientInput] = useState('');
  const [tipAmount, setTipAmount] = useState(0.1);
  const [comment, setComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [recipientProfile, setRecipientProfile] = useState<any>(null);
  const [isWalletAddress, setIsWalletAddress] = useState(false);

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
      
      // Create transaction for tip
      const transaction = await createTipTransaction(
        connection,
        tipAmount,
        publicKey,
        new PublicKey(recipientProfile.walletAddress)
      );

      // Sign and send transaction
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
          isDirectWalletTip: isWalletAddress
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to record donation');
      }

      toast.success('Tip sent successfully! 🎉');
      onOpenChange(false);
      setRecipientInput('');
      setComment('');
      setTipAmount(0.1);
      setRecipientProfile(null);
      setIsWalletAddress(false);
    } catch (error: any) {
      console.error('Error sending tip:', error);
      toast.error(error.message || 'Failed to send tip. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-2">Quick Tip</DialogTitle>
          <DialogDescription className="text-gray-600">
            Send a tip to any creator by entering their username or wallet address
          </DialogDescription>
        </DialogHeader>
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
          
          <div className="space-y-2">
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
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Add a Comment (Optional)</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="rounded-xl min-h-[80px]"
              placeholder="Say something nice..."
            />
          </div>
          
          <Button
            className="w-full bg-[#00E64D] hover:bg-[#00CC44] text-[#0F1611] rounded-full h-12"
            onClick={handleSendTip}
            disabled={isProcessing || !recipientProfile || (!isWalletAddress && tipAmount < (recipientProfile?.minimumTip || 0))}
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
            A platform fee of 0.001 SOL + 3% will be charged
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
} 