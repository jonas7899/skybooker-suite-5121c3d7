import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Operator {
  id: string;
  name: string;
  billing_email: string | null;
  subscription_expires_at: string | null;
  subscription_status: string;
}

const getEmailContent = (operatorName: string, daysRemaining: number, expiryDate: string) => {
  const formattedDate = new Date(expiryDate).toLocaleDateString('hu-HU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  if (daysRemaining <= 0) {
    return {
      subject: `[Vári Gyula Sétarepülés] Az előfizetésed lejárt`,
      html: `
        <h1>Kedves ${operatorName}!</h1>
        <p>Az előfizetésed <strong>lejárt</strong> (${formattedDate}).</p>
        <p>A szolgáltatások használatához kérjük, újítsd meg az előfizetésedet.</p>
        <p>Üdvözlettel,<br>Vári Gyula Sétarepülés</p>
      `
    };
  }

  if (daysRemaining === 1) {
    return {
      subject: `[Vári Gyula Sétarepülés] Az előfizetésed holnap lejár!`,
      html: `
        <h1>Kedves ${operatorName}!</h1>
        <p>Az előfizetésed <strong>holnap lejár</strong> (${formattedDate}).</p>
        <p>Kérjük, gondoskodj az előfizetésed megújításáról, hogy a szolgáltatások zavartalanul működjenek.</p>
        <p>Üdvözlettel,<br>Vári Gyula Sétarepülés</p>
      `
    };
  }

  if (daysRemaining <= 3) {
    return {
      subject: `[Vári Gyula Sétarepülés] Az előfizetésed ${daysRemaining} nap múlva lejár!`,
      html: `
        <h1>Kedves ${operatorName}!</h1>
        <p>Az előfizetésed <strong>${daysRemaining} nap múlva lejár</strong> (${formattedDate}).</p>
        <p>Kérjük, gondoskodj az előfizetésed megújításáról.</p>
        <p>Üdvözlettel,<br>Vári Gyula Sétarepülés</p>
      `
    };
  }

  return {
    subject: `[Vári Gyula Sétarepülés] Az előfizetésed ${daysRemaining} nap múlva lejár`,
    html: `
      <h1>Kedves ${operatorName}!</h1>
      <p>Az előfizetésed <strong>${daysRemaining} nap múlva lejár</strong> (${formattedDate}).</p>
      <p>Emlékeztetőül küldjük ezt az üzenetet, hogy időben meg tudd újítani az előfizetésedet.</p>
      <p>Üdvözlettel,<br>Vári Gyula Sétarepülés</p>
    `
  };
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting subscription expiry check...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get operators with active/trial subscriptions that expire within 7 days or have already expired
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const { data: operators, error: fetchError } = await supabase
      .from("operators")
      .select("id, name, billing_email, subscription_expires_at, subscription_status")
      .in("subscription_status", ["active", "trial"])
      .not("subscription_expires_at", "is", null)
      .lte("subscription_expires_at", sevenDaysFromNow.toISOString());

    if (fetchError) {
      console.error("Error fetching operators:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${operators?.length || 0} operators with expiring subscriptions`);

    const results: { operatorId: string; operatorName: string; status: string; daysRemaining: number }[] = [];

    for (const operator of operators || []) {
      if (!operator.billing_email) {
        console.log(`Skipping operator ${operator.name} - no billing email`);
        results.push({
          operatorId: operator.id,
          operatorName: operator.name,
          status: "skipped - no email",
          daysRemaining: 0
        });
        continue;
      }

      const expiryDate = new Date(operator.subscription_expires_at!);
      const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Only send notifications at specific intervals: 7 days, 3 days, 1 day, and when expired
      const shouldNotify = daysRemaining === 7 || daysRemaining === 3 || daysRemaining === 1 || daysRemaining <= 0;

      if (!shouldNotify) {
        console.log(`Skipping operator ${operator.name} - not at notification interval (${daysRemaining} days remaining)`);
        results.push({
          operatorId: operator.id,
          operatorName: operator.name,
          status: `skipped - ${daysRemaining} days remaining`,
          daysRemaining
        });
        continue;
      }

      const { subject, html } = getEmailContent(operator.name, daysRemaining, operator.subscription_expires_at!);

      try {
        const emailResponse = await resend.emails.send({
          from: "Vári Gyula Sétarepülés <noreply@resend.dev>",
          to: [operator.billing_email],
          subject,
          html,
        });

        console.log(`Email sent to ${operator.billing_email}:`, emailResponse);
        results.push({
          operatorId: operator.id,
          operatorName: operator.name,
          status: "sent",
          daysRemaining
        });

        // If subscription has expired, update the status
        if (daysRemaining <= 0) {
          await supabase
            .from("operators")
            .update({ subscription_status: "expired" })
            .eq("id", operator.id);
          console.log(`Updated operator ${operator.name} status to expired`);
        }
      } catch (emailError: any) {
        console.error(`Error sending email to ${operator.billing_email}:`, emailError);
        results.push({
          operatorId: operator.id,
          operatorName: operator.name,
          status: `error: ${emailError?.message || 'Unknown error'}`,
          daysRemaining
        });
      }
    }

    console.log("Subscription expiry check completed:", results);

    return new Response(
      JSON.stringify({ success: true, processed: results.length, results }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in check-subscription-expiry:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
