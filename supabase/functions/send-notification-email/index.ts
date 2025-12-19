import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: 'booking_created' | 'booking_confirmed' | 'booking_cancelled' | 'support_added' | 'support_updated' | 'account_activated' | 'account_rejected';
  userId: string;
  data?: {
    packageName?: string;
    slotDate?: string;
    slotTime?: string;
    tierName?: string;
    amount?: number;
  };
}

const getEmailContent = (type: string, data?: EmailRequest['data']) => {
  const templates: Record<string, { subject: string; html: string }> = {
    booking_created: {
      subject: 'Foglalás létrehozva - Vári Gyula Sétarepülés',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1a365d;">Foglalás létrehozva!</h1>
          <p>Köszönjük a foglalását! A foglalás jóváhagyásra vár.</p>
          ${data?.packageName ? `<p><strong>Csomag:</strong> ${data.packageName}</p>` : ''}
          ${data?.slotDate ? `<p><strong>Dátum:</strong> ${data.slotDate}</p>` : ''}
          ${data?.slotTime ? `<p><strong>Időpont:</strong> ${data.slotTime}</p>` : ''}
          <p style="color: #666;">Amint a foglalás megerősítésre kerül, értesítjük Önt.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #888; font-size: 12px;">Vári Gyula Sétarepülés</p>
        </div>
      `,
    },
    booking_confirmed: {
      subject: 'Foglalás megerősítve - Vári Gyula Sétarepülés',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #22543d;">Foglalás megerősítve!</h1>
          <p>Örömmel értesítjük, hogy foglalása megerősítésre került!</p>
          ${data?.packageName ? `<p><strong>Csomag:</strong> ${data.packageName}</p>` : ''}
          ${data?.slotDate ? `<p><strong>Dátum:</strong> ${data.slotDate}</p>` : ''}
          ${data?.slotTime ? `<p><strong>Időpont:</strong> ${data.slotTime}</p>` : ''}
          <p style="color: #22543d; font-weight: bold;">Várjuk a repülésen!</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #888; font-size: 12px;">Vári Gyula Sétarepülés</p>
        </div>
      `,
    },
    booking_cancelled: {
      subject: 'Foglalás lemondva - Vári Gyula Sétarepülés',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #742a2a;">Foglalás lemondva</h1>
          <p>Értesítjük, hogy foglalása lemondásra került.</p>
          ${data?.packageName ? `<p><strong>Csomag:</strong> ${data.packageName}</p>` : ''}
          ${data?.slotDate ? `<p><strong>Dátum:</strong> ${data.slotDate}</p>` : ''}
          <p>Ha kérdése van, kérjük lépjen velünk kapcsolatba.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #888; font-size: 12px;">Vári Gyula Sétarepülés</p>
        </div>
      `,
    },
    support_added: {
      subject: 'Támogatói státusz rögzítve - Vári Gyula Sétarepülés',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1a365d;">Köszönjük támogatását!</h1>
          <p>Támogatói státusza sikeresen rögzítésre került.</p>
          ${data?.tierName ? `<p><strong>Szint:</strong> ${data.tierName}</p>` : ''}
          ${data?.amount ? `<p><strong>Összeg:</strong> ${data.amount} EUR</p>` : ''}
          <p style="color: #22543d;">Most már foglalhat repülési csomagokat!</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #888; font-size: 12px;">Vári Gyula Sétarepülés</p>
        </div>
      `,
    },
    support_updated: {
      subject: 'Támogatói státusz frissítve - Vári Gyula Sétarepülés',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1a365d;">Támogatói státusz frissítve</h1>
          <p>Támogatói státusza frissítésre került.</p>
          ${data?.tierName ? `<p><strong>Új szint:</strong> ${data.tierName}</p>` : ''}
          ${data?.amount ? `<p><strong>Összeg:</strong> ${data.amount} EUR</p>` : ''}
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #888; font-size: 12px;">Vári Gyula Sétarepülés</p>
        </div>
      `,
    },
    account_activated: {
      subject: 'Fiók aktiválva - Vári Gyula Sétarepülés',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #22543d;">Üdvözöljük!</h1>
          <p>Fiókja sikeresen aktiválásra került. Mostantól elérheti szolgáltatásainkat.</p>
          <p>Jelentkezzen be fiókjába a foglaláshoz!</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #888; font-size: 12px;">Vári Gyula Sétarepülés</p>
        </div>
      `,
    },
    account_rejected: {
      subject: 'Regisztráció elutasítva - Vári Gyula Sétarepülés',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #742a2a;">Regisztráció elutasítva</h1>
          <p>Sajnálattal értesítjük, hogy regisztrációja elutasításra került.</p>
          <p>24 óra múlva újra próbálkozhat.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #888; font-size: 12px;">Vári Gyula Sétarepülés</p>
        </div>
      `,
    },
  };

  return templates[type] || { subject: 'Értesítés', html: '<p>Értesítés a Vári Gyula Sétarepülés oldalról.</p>' };
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { type, userId, data }: EmailRequest = await req.json();

    console.log(`Processing email notification: ${type} for user ${userId}`);

    // Get user email from auth.users
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    
    if (userError || !userData?.user?.email) {
      console.error('Error fetching user email:', userError);
      return new Response(
        JSON.stringify({ error: 'User email not found' }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userEmail = userData.user.email;
    const emailContent = getEmailContent(type, data);

    console.log(`Sending email to ${userEmail}: ${emailContent.subject}`);

    // Use custom domain once verified in Resend, otherwise fallback to sandbox
    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "Vári Gyula Sétarepülés <onboarding@resend.dev>";
    
    const emailResponse = await resend.emails.send({
      from: fromEmail,
      to: [userEmail],
      subject: emailContent.subject,
      html: emailContent.html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse.data?.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-notification-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
