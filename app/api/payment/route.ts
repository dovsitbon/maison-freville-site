import site from "@/data/site.json";

// Paiement en ligne (Stripe) : prévu mais désactivé. Pour l'activer plus tard :
//  1. data/site.json → payment.enabled = true ;
//  2. variable Vercel STRIPE_SECRET_KEY (npm i stripe) ;
//  3. créer ici une session Stripe Checkout à partir de la commande validée (montant confirmé par la boutique).
export async function POST() {
  if (!site.payment.enabled || !process.env.STRIPE_SECRET_KEY) {
    return Response.json({ ok: false, reason: "payment-disabled" }, { status: 503 });
  }
  return Response.json({ ok: false, reason: "not-implemented" }, { status: 501 });
}
