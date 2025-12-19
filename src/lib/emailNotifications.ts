import { supabase } from "@/integrations/supabase/client";

type NotificationType = 
  | 'booking_created' 
  | 'booking_confirmed' 
  | 'booking_cancelled' 
  | 'support_added' 
  | 'support_updated' 
  | 'account_activated' 
  | 'account_rejected';

interface EmailData {
  packageName?: string;
  slotDate?: string;
  slotTime?: string;
  tierName?: string;
  amount?: number;
}

export const sendNotificationEmail = async (
  type: NotificationType,
  userId: string,
  data?: EmailData
): Promise<boolean> => {
  try {
    const { data: response, error } = await supabase.functions.invoke('send-notification-email', {
      body: { type, userId, data },
    });

    if (error) {
      console.error('Error sending notification email:', error);
      return false;
    }

    console.log('Email notification sent:', response);
    return true;
  } catch (error) {
    console.error('Failed to send notification email:', error);
    return false;
  }
};
