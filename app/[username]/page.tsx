import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import ProfileView from './components/ProfileView';

export const dynamic = 'force-dynamic';

interface Props {
  params: {
    username: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const profile = await prisma.profile.findUnique({
    where: { username: params.username },
  });

  if (!profile) {
    return {
      title: 'Profile Not Found | SOLTIPP',
      description: 'This profile does not exist on SOLTIPP',
    };
  }

  return {
    title: `${profile.displayName} (@${profile.username}) | SOLTIP`,
    description: profile.bio || `Support ${profile.displayName} with SOL tips`,
  };
}

export default function ProfilePage({ params }: Props) {
  return <ProfileView username={params.username} />;
}