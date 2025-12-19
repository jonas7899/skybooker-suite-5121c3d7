import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Profile, UserRole } from '@/contexts/AuthContext';

export interface UserWithRole extends Profile {
  role: UserRole | null;
}

export const useAdminUsers = () => {
  const [pendingUsers, setPendingUsers] = useState<UserWithRole[]>([]);
  const [allUsers, setAllUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        throw profilesError;
      }

      // Fetch all user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) {
        throw rolesError;
      }

      // Combine profiles with roles
      const usersWithRoles: UserWithRole[] = (profiles || []).map(profile => ({
        ...profile,
        role: roles?.find(r => r.user_id === profile.id) || null,
      })) as UserWithRole[];

      setAllUsers(usersWithRoles);
      setPendingUsers(usersWithRoles.filter(u => u.status === 'pending'));
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Hiba',
        description: 'Nem sikerült betölteni a felhasználókat',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const approveUser = async (userId: string, approvedBy: string) => {
    try {
      // Update profile status
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ status: 'active' })
        .eq('id', userId);

      if (profileError) throw profileError;

      // Update user role with approval info
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({
          approved_by: approvedBy,
          approved_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (roleError) throw roleError;

      // Create notification for the user
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: 'Fiókod aktiválva',
          message: 'Gratulálunk! A regisztrációd jóváhagyásra került. Most már beléphetsz és foglalhatsz időpontot, ha támogatod az egyesületet.',
          type: 'account_approved',
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
      }

      // Send email notification via edge function
      try {
        await supabase.functions.invoke('send-notification-email', {
          body: {
            type: 'account_activated',
            userId: userId,
          },
        });
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
      }

      toast({
        title: 'Felhasználó jóváhagyva',
        description: 'A felhasználó sikeresen aktiválva lett',
      });

      await fetchUsers();
    } catch (error) {
      console.error('Error approving user:', error);
      toast({
        title: 'Hiba',
        description: 'Nem sikerült jóváhagyni a felhasználót',
        variant: 'destructive',
      });
    }
  };

  const rejectUser = async (userId: string, reason?: string) => {
    try {
      const cooldownEnd = new Date();
      cooldownEnd.setHours(cooldownEnd.getHours() + 24);

      // Update profile status
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          status: 'rejected',
          rejected_until: cooldownEnd.toISOString(),
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      // Update user role with rejection info
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({
          rejected_at: new Date().toISOString(),
          rejection_reason: reason || null,
        })
        .eq('user_id', userId);

      if (roleError) throw roleError;

      toast({
        title: 'Felhasználó elutasítva',
        description: '24 óra múlva újra regisztrálhat',
      });

      await fetchUsers();
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast({
        title: 'Hiba',
        description: 'Nem sikerült elutasítani a felhasználót',
        variant: 'destructive',
      });
    }
  };

  const suspendUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'suspended' })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Felhasználó felfüggesztve',
        description: 'A fiók felfüggesztésre került',
      });

      await fetchUsers();
    } catch (error) {
      console.error('Error suspending user:', error);
      toast({
        title: 'Hiba',
        description: 'Nem sikerült felfüggeszteni a felhasználót',
        variant: 'destructive',
      });
    }
  };

  const activateUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'active', rejected_until: null })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Felhasználó aktiválva',
        description: 'A fiók újra aktív',
      });

      await fetchUsers();
    } catch (error) {
      console.error('Error activating user:', error);
      toast({
        title: 'Hiba',
        description: 'Nem sikerült aktiválni a felhasználót',
        variant: 'destructive',
      });
    }
  };

  return {
    pendingUsers,
    allUsers,
    isLoading,
    approveUser,
    rejectUser,
    suspendUser,
    activateUser,
    refetch: fetchUsers,
  };
};
