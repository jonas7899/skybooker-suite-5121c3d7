import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Processing booking reminders...');

    // Find pending reminders that are due
    const { data: dueReminders, error: fetchError } = await supabase
      .from('booking_reminders')
      .select(`
        id,
        booking_id,
        reminder_type,
        scheduled_for,
        booking:bookings(
          id,
          user_id,
          status,
          flight_package:flight_packages(name),
          time_slot:flight_time_slots(slot_date, start_time)
        )
      `)
      .eq('sent', false)
      .lte('scheduled_for', new Date().toISOString())
      .limit(50);

    if (fetchError) {
      console.error('Error fetching reminders:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${dueReminders?.length || 0} due reminders`);

    if (!dueReminders || dueReminders.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No pending reminders', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let processed = 0;
    let errors = 0;

    for (const reminder of dueReminders) {
      try {
        const booking = reminder.booking as any;
        
        // Skip if booking is cancelled
        if (!booking || booking.status === 'cancelled') {
          // Mark as sent to skip in future
          await supabase
            .from('booking_reminders')
            .update({ sent: true, sent_at: new Date().toISOString() })
            .eq('id', reminder.id);
          continue;
        }

        // Create notification
        const reminderText = reminder.reminder_type === '24h_before' 
          ? 'Holnap lesz a repülésed!' 
          : 'Egy hét múlva lesz a repülésed!';
        
        const packageName = booking.flight_package?.name || 'Repülés';
        const slotDate = booking.time_slot?.slot_date || '';
        const slotTime = booking.time_slot?.start_time?.substring(0, 5) || '';

        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: booking.user_id,
            title: reminderText,
            message: `${packageName} - ${slotDate} ${slotTime}`,
            type: 'booking_reminder',
            related_booking_id: booking.id,
          });

        if (notifError) {
          console.error('Error creating notification:', notifError);
          errors++;
          continue;
        }

        // Mark reminder as sent
        await supabase
          .from('booking_reminders')
          .update({ sent: true, sent_at: new Date().toISOString() })
          .eq('id', reminder.id);

        processed++;
        console.log(`Processed reminder ${reminder.id} for booking ${booking.id}`);

      } catch (err) {
        console.error(`Error processing reminder ${reminder.id}:`, err);
        errors++;
      }
    }

    console.log(`Finished processing. Success: ${processed}, Errors: ${errors}`);

    return new Response(
      JSON.stringify({ 
        message: 'Reminders processed', 
        processed, 
        errors,
        total: dueReminders.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-reminders:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
