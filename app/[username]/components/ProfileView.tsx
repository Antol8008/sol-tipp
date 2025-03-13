'use client';

import { useEffect, useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';
import { Twitter, Github, Globe, Loader2, ExternalLink, Star, Pencil, Gift } from 'lucide-react';
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
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

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

// Add these new animations at the top level
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
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
    <div className="min-h-screen bg-gradient-to-b from-[#FAFAFA] to-white pt-16">
      {/* Banner with parallax effect */}
      <div 
        className="h-64 md:h-80 bg-gradient-to-r from-[#00E64D]/10 to-[#00CC44]/10 relative overflow-hidden"
        style={profile.bannerUrl ? {
          backgroundImage: `url(${profile.bannerUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        } : undefined}
      >
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      </div>

      <motion.div 
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
        initial="initial"
        animate="animate"
        variants={staggerChildren}
      >
        {/* Profile Info Card */}
        <motion.div 
          className="relative -mt-32 mb-8"
          variants={fadeInUp}
        >
          <div className="bg-white rounded-3xl p-8 shadow-xl backdrop-blur-lg bg-white/90 border border-gray-100">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Avatar with hover effect */}
              <motion.div 
                className="w-40 h-40 rounded-2xl overflow-hidden border-4 border-white shadow-2xl transform hover:scale-105 transition-transform duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {profile.avatarUrl ? (
                  <Image
                    width={160}
                    height={160}
                    src={profile.avatarUrl} 
                    alt={profile.displayName} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#00E64D]/20 to-[#00CC44]/20 flex items-center justify-center text-[#00E64D] text-4xl font-heading">
                    {profile.displayName[0]}
                  </div>
                )}
              </motion.div>

              <div className="flex-1 text-center md:text-left space-y-4">
                <motion.div variants={fadeInUp}>
                  <h1 className="text-4xl font-bold font-heading mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {profile.displayName}
                  </h1>
                  <p className="text-gray-500 font-jakarta text-lg mb-2">@{profile.username}</p>
                </motion.div>

                <motion.a
                  variants={fadeInUp}
                  href={`https://solscan.io/account/${profile.walletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm bg-gray-50 px-4 py-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                >
                  {`${profile.walletAddress.slice(0, 4)}...${profile.walletAddress.slice(-4)}`}
                  <ExternalLink className="h-4 w-4 ml-2 text-gray-500" />
                </motion.a>

                {profile.bio && (
                  <motion.p 
                    variants={fadeInUp}
                    className="text-gray-700 text-lg leading-relaxed max-w-2xl font-jakarta"
                  >
                    {profile.bio}
                  </motion.p>
                )}

                {/* Social Links with hover effects */}
                {profile.socialLinks && (
                  <motion.div 
                    variants={fadeInUp}
                    className="flex gap-6 justify-center md:justify-start my-6"
                  >
                    {profile.socialLinks.twitter && (
                      <motion.a 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        href={profile.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-[#1DA1F2] transition-colors duration-200"
                      >
                        <Twitter className="h-6 w-6" />
                      </motion.a>
                    )}
                    {profile.socialLinks.github && (
                      <motion.a 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        href={profile.socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-[#333] transition-colors duration-200"
                      >
                        <Github className="h-6 w-6" />
                      </motion.a>
                    )}
                    {profile.socialLinks.website && (
                      <motion.a 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        href={profile.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-[#00E64D] transition-colors duration-200"
                      >
                        <Globe className="h-6 w-6" />
                      </motion.a>
                    )}
                  </motion.div>
                )}

                {/* Action Buttons */}
                <motion.div 
                  variants={fadeInUp}
                  className="flex items-center justify-center md:justify-start gap-4"
                >
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
                    <WalletMultiButton className="!bg-[#00E64D] hover:!bg-[#00CC44] !rounded-full !px-8 !py-6 !text-lg !font-medium !shadow-lg hover:!shadow-xl !transition-all !duration-200" />
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div 
          variants={fadeInUp}
          className="bg-white rounded-3xl p-8 shadow-xl mb-8 border border-gray-100"
        >
          <h2 className="text-2xl font-bold font-heading mb-8 flex items-center gap-3">
            <Gift className="h-6 w-6 text-[#00E64D]" />
            Recent Activity
          </h2>
          
          <AnimatePresence>
            {donations.length > 0 ? (
              <motion.div 
                className="space-y-6"
                variants={staggerChildren}
              >
                {donations.map((donation, index) => (
                  <motion.div
                    key={donation.id}
                    variants={fadeInUp}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#00E64D]/20 to-[#00CC44]/20 rounded-xl flex items-center justify-center shadow-inner">
                          <span className="text-xl">🎁</span>
                        </div>
                        <div className="font-jakarta">
                          <div className="font-medium text-lg">
                            {donation.donor.displayName || 
                             `${donation.donor.walletAddress.slice(0, 4)}...${donation.donor.walletAddress.slice(-4)}`}
                          </div>
                          <div className="text-[#00E64D] font-medium">
                            sent {donation.amount} SOL
                          </div>
                        </div>
                      </div>
                      <time className="text-sm text-gray-500 font-jakarta bg-gray-50 px-3 py-1 rounded-full">
                        {new Date(donation.createdAt).toLocaleDateString()}
                      </time>
                    </div>
                    {donation.comment && (
                      <div className="mt-4 text-gray-700 bg-gray-50 rounded-xl p-5 font-jakarta leading-relaxed">
                        &ldquo;{donation.comment}&rdquo;
                      </div>
                    )}
                    <motion.a
                      whileHover={{ scale: 1.02 }}
                      href={`https://solscan.io/tx/${donation.signature}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center text-sm text-gray-500 hover:text-[#00E64D] transition-colors duration-200 bg-white px-4 py-2 rounded-full border border-gray-100 hover:shadow-md"
                    >
                      View Transaction
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </motion.a>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                variants={fadeInUp}
                className="text-center py-16"
              >
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Gift className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-600 text-lg font-jakarta">No donations yet</p>
                <p className="text-gray-400 mt-2">Be the first one to send a tip!</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
} 