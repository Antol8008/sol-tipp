'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Loader2, Twitter, Github, Globe, Upload, Wallet } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Connection, PublicKey } from '@solana/web3.js';
import { createTipTransaction } from '@/lib/solana';
import { uploadImage } from '@/lib/uploadImage';

const profileSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  displayName: z.string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must be less than 50 characters'),
  bio: z.string()
    .max(500, 'Bio must be less than 500 characters')
    .optional(),
  minimumTip: z.number()
    .min(0.01, 'Minimum tip must be at least 0.01 SOL')
    .max(100, 'Minimum tip must be less than 100 SOL'),
  twitter: z.string().url().optional(),
  github: z.string().url().optional(),
  website: z.string().url().optional(),
});

export default function CreatePage() {
  const { connected, publicKey, signTransaction, signMessage } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const router = useRouter();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: '',
      displayName: '',
      bio: '',
      minimumTip: 0.1,
      twitter: '',
      github: '',
      website: '',
    },
  });

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    if (!connected || !publicKey || !signTransaction || !signMessage) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsSubmitting(true);
    try {
      // Handle platform fee transaction
      const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL!);
      const transaction = await createTipTransaction(
        connection,
        0.001, // Platform fee in SOL
        publicKey,
        new PublicKey(process.env.NEXT_PUBLIC_PLATFORM_FEE_ACCOUNT!)
      );
      
      const signedTx = await signTransaction(transaction);
      const txSignature = await connection.sendRawTransaction(signedTx.serialize());
      
      // Wait for transaction confirmation using blockhash-based strategy
      const confirmationStrategy = {
        signature: txSignature,
        blockhash: transaction.recentBlockhash!,
        lastValidBlockHeight: transaction.lastValidBlockHeight!,
      };
      
      await connection.confirmTransaction(confirmationStrategy);

      // Upload images if provided
      let avatarUrl = null;
      let bannerUrl = null;
      
      if (avatarFile) {
        avatarUrl = await uploadImage(avatarFile);
        if (!avatarUrl) {
          toast.error('Failed to upload avatar image');
          return;
        }
      }
      
      if (bannerFile) {
        bannerUrl = await uploadImage(bannerFile);
        if (!bannerUrl) {
          toast.error('Failed to upload banner image');
          return;
        }
      }

      // Create profile using Prisma
      const profile = await fetch('/api/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          username: values.username,
          displayName: values.displayName,
          bio: values.bio,
          minimumTip: values.minimumTip,
          avatarUrl: avatarUrl,
          bannerUrl: bannerUrl,
          socialLinks: {
            twitter: values.twitter || null,
            github: values.github || null,
            website: values.website || null,
          },
        }),
      });

      if (!profile.ok) {
        const error = await profile.json();
        throw new Error(error.error || 'Failed to create profile');
      }
      
      toast.success('Profile created successfully!');
      router.push(`/${values.username}`);
    } catch (error: any) {
      console.error('Error creating profile:', error);
      toast.error(error.message || 'Failed to create profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-16">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#00E64D] to-[#00CC44] bg-clip-text text-transparent">
              Create Your Creator Profile
            </h1>
            <p className="text-gray-600">
              Set up your profile and start receiving tips from your supporters
            </p>
          </div>
          
          {!connected ? (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 bg-[#00E64D]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Wallet className="w-8 h-8 text-[#00E64D]" />
              </div>
              <h2 className="text-2xl font-semibold mb-4">Connect Your Wallet</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Connect your Solana wallet to create your profile and start receiving tips.
                A one-time fee of 0.1 SOL is required.
              </p>
              <WalletMultiButton className="!bg-[#00E64D] hover:!bg-[#00CC44] !rounded-full !px-8 !py-4" />
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <div className="flex items-center">
                              <div className="bg-gray-100 px-4 py-2 rounded-l-full border border-r-0">
                                soltipp.com/
                              </div>
                              <Input 
                                {...field} 
                                placeholder="your-username"
                                className="rounded-r-full"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Your Name" className="rounded-full" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="minimumTip"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Tip Amount (SOL)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              step="0.01"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              className="rounded-full"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Tell your supporters about yourself..."
                              className="rounded-2xl min-h-[120px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <h3 className="font-medium">Social Links</h3>
                      <div className="grid gap-4">
                        <FormField
                          control={form.control}
                          name="twitter"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div className="relative">
                                  <Twitter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                  <Input 
                                    {...field} 
                                    placeholder="Twitter URL"
                                    className="rounded-full pl-10" 
                                  />
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="github"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div className="relative">
                                  <Github className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                  <Input 
                                    {...field} 
                                    placeholder="GitHub URL"
                                    className="rounded-full pl-10" 
                                  />
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="website"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div className="relative">
                                  <Globe className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                  <Input 
                                    {...field} 
                                    placeholder="Personal Website"
                                    className="rounded-full pl-10" 
                                  />
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Picture
                    </label>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-gray-400" />
                          <p className="text-sm text-gray-500">Click to upload</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Banner Image
                    </label>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-gray-400" />
                          <p className="text-sm text-gray-500">Click to upload</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#00E64D] hover:bg-[#00CC44] text-[#0F1611] rounded-full h-14 text-lg font-medium"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Creating Profile...
                      </>
                    ) : (
                      'Create Profile'
                    )}
                  </Button>
                  <p className="text-sm text-gray-500 text-center mt-4">
                    A one-time fee of 0.1 SOL will be charged to create your profile
                  </p>
                </div>
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}