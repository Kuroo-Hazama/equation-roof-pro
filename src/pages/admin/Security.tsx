import { useState } from "react";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lock, Mail, Calendar, ShieldCheck } from "lucide-react";

const passwordSchema = z
  .string()
  .min(8, { message: "8 caractères minimum" })
  .max(100)
  .regex(/[A-Z]/, { message: "Au moins une majuscule" })
  .regex(/[0-9]/, { message: "Au moins un chiffre" });

const Security = () => {
  const { user } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const lastSignIn = user?.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleString("fr-FR")
    : "—";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next !== confirm) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    const parsed = passwordSchema.safeParse(next);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    if (!user?.email) return;

    setSubmitting(true);
    // Re-vérification du mot de passe actuel
    const { error: signErr } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: current,
    });
    if (signErr) {
      toast.error("Mot de passe actuel incorrect");
      setSubmitting(false);
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: parsed.data });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Mot de passe mis à jour");
    setCurrent("");
    setNext("");
    setConfirm("");
  };

  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-heading text-foreground flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" /> Mon compte — Sécurité
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Gérez votre mot de passe et consultez vos informations.</p>
      </header>

      <section className="bg-card border rounded-xl p-6 space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <Mail className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Email :</span>
          <span className="font-medium">{user?.email}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Dernière connexion :</span>
          <span className="font-medium">{lastSignIn}</span>
        </div>
      </section>

      <section className="bg-card border rounded-xl p-6">
        <h2 className="text-lg font-heading mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4" /> Changer mon mot de passe
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="current">Mot de passe actuel</Label>
            <Input id="current" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="next">Nouveau mot de passe</Label>
            <Input id="next" type="password" value={next} onChange={(e) => setNext(e.target.value)} required />
            <p className="text-xs text-muted-foreground mt-1">8 caractères min., 1 majuscule, 1 chiffre.</p>
          </div>
          <div>
            <Label htmlFor="confirm">Confirmer le nouveau mot de passe</Label>
            <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </div>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Mise à jour…" : "Mettre à jour le mot de passe"}
          </Button>
        </form>
      </section>
    </div>
  );
};

export default Security;
