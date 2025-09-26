import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useNotifications = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Set up real-time subscription for new contact inquiries
    const channel = supabase
      .channel('contact_inquiries_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'contact_inquiries'
        },
        (payload) => {
          console.log('New contact inquiry received:', payload);
          
          // Show toast notification
          toast({
            title: "New Message Received! 📧",
            description: `New inquiry from ${payload.new.email}`,
            duration: 5000,
          });

          // Update unread count
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    // Get initial unread count (for demo purposes, we'll consider all as unread)
    const getUnreadCount = async () => {
      try {
        const { data, error } = await supabase
          .from('contact_inquiries')
          .select('id', { count: 'exact' });

        if (error) {
          console.error('Error fetching unread count:', error);
          return;
        }

        // For demo purposes, we'll show the total count
        // In a real app, you'd track read/unread status
        setUnreadCount(data?.length || 0);
      } catch (error) {
        console.error('Error in getUnreadCount:', error);
      }
    };

    getUnreadCount();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const markAsRead = () => {
    setUnreadCount(0);
  };

  return { unreadCount, markAsRead };
};