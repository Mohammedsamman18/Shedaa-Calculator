import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
        if (error) throw error;
        toast.success("تم إنشاء الحساب! تحقق من بريدك الإلكتروني.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("تم تسجيل الدخول بنجاح!");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-table-green px-6 pt-16 pb-20 text-center">
        <div className="text-6xl mb-3">♠️</div>
        <h1 className="text-3xl font-black text-table-green-foreground mb-2">حسابات المور</h1>
        <p className="text-table-green-foreground/70 text-sm">تسجيل نتائج لعبة الشدة</p>
      </div>

      <div className="flex-1 px-5 -mt-10">
        <div className="bg-card rounded-xl p-6 card-shadow max-w-sm mx-auto">
          <h2 className="text-xl font-bold text-card-foreground mb-4 text-center">
            {isSignUp ? "إنشاء حساب جديد" : "تسجيل الدخول"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              dir="ltr"
            />
            <Input
              type="password"
              placeholder="كلمة المرور"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              dir="ltr"
            />
            <Button type="submit" className="w-full bg-primary text-primary-foreground font-bold" disabled={loading}>
              {loading ? "جارٍ..." : isSignUp ? "إنشاء حساب" : "دخول"}
            </Button>
          </form>

          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full text-center text-sm text-muted-foreground mt-4 hover:text-foreground"
          >
            {isSignUp ? "لديك حساب؟ سجل الدخول" : "ليس لديك حساب؟ أنشئ واحداً"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
