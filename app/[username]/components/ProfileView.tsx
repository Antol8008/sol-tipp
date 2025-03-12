'use client';

import { useEffect, useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';
import { Twitter, Github, Globe, Loader2, ExternalLink, Star, Pencil } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { Profile } from '@prisma/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Connection, PublicKey } from '@solana/web3.js';
import { createTipTransaction } from '@/lib/solana';

interface SocialLinks {
  twitter?: string | null;
  github?: string | null;
  website?: string | null;
}

interface ProfileWithParsedJson extends Omit<Profile, 'socialLinks'> {
  socialLinks: SocialLinks | null;
}

interface ProfileViewProps {
  username: string;
}

interface Donation {
  id: string;
  amount: number;
  comment?: string | null;
  signature: string;
  createdAt: string;
  donor: {
    walletAddress: string;
    username?: string;
    displayName?: string;
  };
}

interface TipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: ProfileWithParsedJson;
  onSendTip: (amount: number, comment?: string) => Promise<void>;
  isProcessing: boolean;
}

interface Review {
  id: string;
  content: string;
  rating: number;
  createdAt: string;
  reviewer: {
    walletAddress: string;
    username?: string;
    displayName?: string;
  };
}

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitReview: (content: string, rating: number) => Promise<void>;
  isSubmitting: boolean;
}

interface EditProfileDialogProps {
  profile: ProfileWithParsedJson;
  onSave: (data: Partial<ProfileWithParsedJson>) => Promise<void>;
}

const TipDialog = ({ open, onOpenChange, profile, onSendTip, isProcessing }: TipDialogProps) => {
  const [tipAmount, setTipAmount] = useState<number>(profile.minimumTip || 0.1);
  const [comment, setComment] = useState('');
  
  const quickOptions = [
    { amount: profile.minimumTip || 0.1, label: '🎯 Preferred' },
    { amount: (profile.minimumTip || 0.1) * 2, label: '🚀 Double' },
    { amount: (profile.minimumTip || 0.1) * 5, label: '🌟 Premium' },
  ];

  const handleSendTip = useCallback(async () => {
    if (tipAmount < (profile.minimumTip || 0)) {
      toast.error(`Minimum tip amount is ${profile.minimumTip} SOL`);
      return;
    }
    await onSendTip(tipAmount, comment.trim() || undefined);
    setComment('');
  }, [tipAmount, comment, profile.minimumTip, onSendTip]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button 
          size="lg"
          className="bg-[#00E64D] hover:bg-[#00CC44] text-[#0F1611] rounded-full px-8"
        >
          Send Tip
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-2">Send a Tip to {profile.displayName}</DialogTitle>
          <DialogDescription className="text-gray-600">
            Support {profile.displayName}&apos;s work with SOL. Minimum tip: {profile.minimumTip} SOL
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
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
              min={profile.minimumTip || 0}
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
            disabled={isProcessing || tipAmount < (profile.minimumTip || 0)}
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
};

const EditProfileDialog = ({ profile, onSave }: EditProfileDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    displayName: profile.displayName,
    bio: profile.bio || '',
    minimumTip: profile.minimumTip,
    avatarUrl: profile.avatarUrl || '',
    bannerUrl: profile.bannerUrl || '',
    socialLinks: profile.socialLinks || {},
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSave(formData);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Pencil className="h-4 w-4" />
          Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Display Name</label>
            <Input
              value={formData.displayName}
              onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
              className="rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Bio</label>
            <Textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              className="rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Minimum Tip (SOL)</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={formData.minimumTip}
              onChange={(e) => setFormData(prev => ({ ...prev, minimumTip: parseFloat(e.target.value) }))}
              className="rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Avatar URL</label>
            <Input
              value={formData.avatarUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, avatarUrl: e.target.value }))}
              className="rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Banner URL</label>
            <Input
              value={formData.bannerUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, bannerUrl: e.target.value }))}
              className="rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Twitter URL</label>
            <Input
              value={formData.socialLinks?.twitter || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                socialLinks: { ...prev.socialLinks, twitter: e.target.value }
              }))}
              className="rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">GitHub URL</label>
            <Input
              value={formData.socialLinks?.github || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                socialLinks: { ...prev.socialLinks, github: e.target.value }
              }))}
              className="rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Website URL</label>
            <Input
              value={formData.socialLinks?.website || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                socialLinks: { ...prev.socialLinks, website: e.target.value }
              }))}
              className="rounded-lg"
            />
          </div>
          <Button
            className="w-full bg-[#00E64D] hover:bg-[#00CC44] text-black rounded-full h-12"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function ProfileView({ username }: ProfileViewProps) {
  const [profile, setProfile] = useState<ProfileWithParsedJson | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [donations, setDonations] = useState<Donation[]>([]);
  const { connected, publicKey, signTransaction } = useWallet();
  const [tipDialogOpen, setTipDialogOpen] = useState(false);
  const isOwner = connected && publicKey?.toString() === profile?.walletAddress;

  useEffect(() => {
    async function fetchProfileAndDonations() {
      try {
        const [profileRes, donationsRes] = await Promise.all([
          fetch(`/api/profiles/${username}`),
          fetch(`/api/profiles/${username}/donations`)
        ]);

        if (!profileRes.ok) {
          throw new Error('Profile not found');
        }

        const [profileData, donationsData] = await Promise.all([
          profileRes.json(),
          donationsRes.json()
        ]);

        setProfile(profileData as ProfileWithParsedJson);
        setDonations(donationsData as Donation[]);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }

    fetchProfileAndDonations();
  }, [username]);

  const handleSendTip = useCallback(async (tipAmount: number, comment?: string) => {
    if (!connected || !publicKey || !signTransaction || !profile) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsProcessing(true);
    try {
      const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL!);
      
      // Create single transaction for both platform fee and tip
      const transaction = await createTipTransaction(
        connection,
        tipAmount,
        publicKey,
        new PublicKey(profile.walletAddress)
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
      const response = await fetch(`/api/profiles/${username}/donations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: tipAmount,
          comment,
          signature: txSignature,
          walletAddress: publicKey.toString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to record donation');
      }

      const newDonation = await response.json();
      setDonations(prev => [newDonation, ...prev]);
      
      toast.success('Tip sent successfully! 🎉');
      setTipDialogOpen(false);
    } catch (error: any) {
      console.error('Error sending tip:', error);
      toast.error(error.message || 'Failed to send tip. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [connected, publicKey, signTransaction, profile, username]);

  const handleUpdateProfile = async (data: Partial<ProfileWithParsedJson>) => {
    try {
      const response = await fetch(`/api/profiles/${username}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] pt-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#00E64D]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] pt-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Profile not found</h1>
          <p className="text-gray-600 mb-8">This username does not exist on SOLTIPP</p>
          <Button asChild>
            <a href="/">Go Home</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-16">
      {/* Banner */}
      <div 
        className="h-48 md:h-64 bg-gradient-to-r from-[#00E64D]/10 to-[#00CC44]/10"
        style={profile.bannerUrl ? { 
          backgroundImage: `url(${profile.bannerUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : undefined}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Info */}
        <div className="relative -mt-20 mb-8">
          <div className="bg-white rounded-3xl p-8 shadow-lg">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100">
                {profile.avatarUrl ? (
                  <img 
                    src={profile.avatarUrl} 
                    alt={profile.displayName} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#00E64D]/10 flex items-center justify-center text-[#00E64D] text-2xl font-heading">
                    {profile.displayName[0]}
                  </div>
                )}
              </div>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold font-heading mb-2">{profile.displayName}</h1>
                <p className="text-gray-500 font-jakarta mb-2">@{profile.username}</p>
                <a
                  href={`https://solscan.io/account/${profile.walletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-gray-500 hover:text-[#00E64D] mb-4 font-jakarta"
                >
                  {`${profile.walletAddress.slice(0, 4)}...${profile.walletAddress.slice(-4)}`}
                  <ExternalLink className="h-4 w-4 ml-1" />
                </a>
                {profile.bio && (
                  <p className="text-gray-700 mb-6 max-w-2xl font-jakarta">{profile.bio}</p>
                )}

                {/* Social Links */}
                {profile.socialLinks && (
                  <div className="flex gap-4 justify-center md:justify-start mb-6">
                    {profile.socialLinks.twitter && (
                      <a 
                        href={profile.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-[#00E64D]"
                      >
                        <Twitter className="h-5 w-5" />
                      </a>
                    )}
                    {profile.socialLinks.github && (
                      <a 
                        href={profile.socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-[#00E64D]"
                      >
                        <Github className="h-5 w-5" />
                      </a>
                    )}
                    {profile.socialLinks.website && (
                      <a 
                        href={profile.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-[#00E64D]"
                      >
                        <Globe className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-center md:justify-start gap-4">
                  {connected ? (
                    <>
                      {!isOwner && (
                        <TipDialog
                          open={tipDialogOpen}
                          onOpenChange={setTipDialogOpen}
                          profile={profile}
                          onSendTip={handleSendTip}
                          isProcessing={isProcessing}
                        />
                      )}
                      {isOwner && (
                        <EditProfileDialog
                          profile={profile}
                          onSave={handleUpdateProfile}
                        />
                      )}
                    </>
                  ) : (
                    <WalletMultiButton className="!bg-[#00E64D] hover:!bg-[#00CC44] !rounded-full" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-3xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold font-heading mb-6">Recent Activity</h2>
          {donations.length > 0 ? (
            <div className="space-y-6">
              {donations.map((donation) => (
                <div key={donation.id} className="bg-gray-50 rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#00E64D]/10 rounded-full flex items-center justify-center">
                        <span className="text-lg">🎁</span>
                      </div>
                      <div className="font-jakarta">
                        <div className="font-medium">
                          {donation.donor.displayName || 
                           `${donation.donor.walletAddress.slice(0, 4)}...${donation.donor.walletAddress.slice(-4)}`}
                        </div>
                        <div className="text-sm text-gray-500">
                          sent {donation.amount} SOL
                        </div>
                      </div>
                    </div>
                    <time className="text-sm text-gray-500 font-jakarta">
                      {new Date(donation.createdAt).toLocaleDateString()}
                    </time>
                  </div>
                  {donation.comment && (
                    <div className="mt-3 text-gray-700 bg-white rounded-xl p-4 font-jakarta">
                      {donation.comment}
                    </div>
                  )}
                  <a
                    href={`https://solscan.io/tx/${donation.signature}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center text-sm text-gray-500 hover:text-[#00E64D] font-jakarta"
                  >
                    View Transaction
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8 font-jakarta">No donations yet</p>
          )}
        </div>
      </div>
    </div>
  );
} 