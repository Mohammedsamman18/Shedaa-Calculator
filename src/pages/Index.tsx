import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, PlusCircle, History, Trophy, LogOut } from "lucide-react";
import { getPlayers, getMatches } from "@/lib/store";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { signOut } = useAuth();
  const [playerCount, setPlayerCount] = useState(0);
  const [matchCount, setMatchCount] = useState(0);

  useEffect(() => {
    getPlayers().then(p => setPlayerCount(p.length));
    getMatches().then(m => setMatchCount(m.filter(x => x.winner_team !== null).length));
  }, []);

  const menuItems = [
    { to: "/new-match", icon: PlusCircle, label: "مباراة جديدة", desc: "ابدأ تسجيل مباراة" },
    { to: "/players", icon: Users, label: "اللاعبون", desc: `${playerCount} لاعب مسجل` },
    { to: "/history", icon: History, label: "السجل", desc: `${matchCount} مباراة` },
    { to: "/stats", icon: Trophy, label: "الإحصائيات", desc: "لوحة المتصدرين" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-table-green px-6 pt-12 pb-16 text-center relative">
        <Button variant="ghost" size="icon" onClick={signOut} className="absolute top-4 left-4 text-table-green-foreground/70 hover:text-table-green-foreground">
          <LogOut className="h-5 w-5" />
        </Button>
        <div className="text-6xl mb-3">♠️</div>
        <h1 className="text-3xl font-black text-table-green-foreground mb-2">حسابات المور</h1>
        <p className="text-table-green-foreground/70 text-sm">تسجيل نتائج لعبة الشدة</p>
      </div>

      <div className="flex-1 px-5 -mt-8">
        <div className="grid grid-cols-2 gap-3">
          {menuItems.map(item => (
            <Link key={item.to} to={item.to} className="bg-card rounded-xl p-5 card-shadow hover:scale-[1.02] transition-transform">
              <item.icon className="h-8 w-8 text-accent mb-3" />
              <h2 className="font-bold text-card-foreground">{item.label}</h2>
              <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
