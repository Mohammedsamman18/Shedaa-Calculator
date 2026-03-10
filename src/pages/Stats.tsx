import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Trophy, Users } from "lucide-react";
import { getPlayers, getPlayerStats, getTeamStats } from "@/lib/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Stats = () => {
  const [playerStats, setPlayerStats] = useState<any[]>([]);
  const [teamStatsData, setTeamStatsData] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getName = (id: string) => players.find(p => p.id === id)?.name || "؟";
  const medals = ["🥇", "🥈", "🥉"];

  useEffect(() => {
    const load = async () => {
      const p = await getPlayers();
      setPlayers(p);
      const stats = await Promise.all(p.map(async pl => ({ ...pl, ...(await getPlayerStats(pl.id)) })));
      setPlayerStats(stats.filter(s => s.matchCount > 0).sort((a, b) => b.wins - a.wins));
      setTeamStatsData(await getTeamStats());
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">جارٍ التحميل...</div>;

  return (
    <div className="min-h-screen">
      <div className="bg-table-green px-5 pt-10 pb-6">
        <Link to="/" className="text-table-green-foreground/70 inline-flex items-center gap-1 text-sm mb-4"><ArrowRight className="h-4 w-4" /> الرئيسية</Link>
        <h1 className="text-2xl font-black text-table-green-foreground">الإحصائيات</h1>
      </div>
      <div className="px-5 py-4">
        <Tabs defaultValue="players" className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="players" className="flex-1 gap-1"><Trophy className="h-4 w-4" /> اللاعبون</TabsTrigger>
            <TabsTrigger value="teams" className="flex-1 gap-1"><Users className="h-4 w-4" /> الفرق</TabsTrigger>
          </TabsList>
          <TabsContent value="players">
            <div className="space-y-2">
              {playerStats.map((p, i) => (
                <div key={p.id} className="bg-card rounded-xl p-4 card-shadow flex items-center gap-3">
                  <span className="text-2xl w-10 text-center">{medals[i] || `#${i + 1}`}</span>
                  <div className="flex-1">
                    <p className="font-bold text-card-foreground">{p.name}</p>
                    <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                      <span className="text-success font-semibold">{p.wins} فوز</span>
                      <span className="text-destructive">{p.losses} خسارة</span>
                      <span>{p.matchCount} مباراة</span>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground">متوسط النقاط</p>
                    <p className="text-xl font-black text-primary">{p.avgPoints}</p>
                  </div>
                </div>
              ))}
              {playerStats.length === 0 && <p className="text-center text-muted-foreground py-12">لا توجد إحصائيات بعد.</p>}
            </div>
          </TabsContent>
          <TabsContent value="teams">
            <div className="space-y-2">
              {teamStatsData.map((t, i) => (
                <div key={i} className="bg-card rounded-xl p-4 card-shadow flex items-center gap-3">
                  <span className="text-2xl w-10 text-center">{medals[i] || `#${i + 1}`}</span>
                  <div className="flex-1">
                    <p className="font-bold text-card-foreground">{getName(t.player1Id)} و {getName(t.player2Id)}</p>
                    <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                      <span className="text-success font-semibold">{t.wins} فوز</span>
                      <span className="text-destructive">{t.losses} خسارة</span>
                      <span>{t.matches} مباراة</span>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-2xl font-black text-accent">{t.matches > 0 ? Math.round((t.wins / t.matches) * 100) : 0}%</p>
                    <p className="text-xs text-muted-foreground">نسبة الفوز</p>
                  </div>
                </div>
              ))}
              {teamStatsData.length === 0 && <p className="text-center text-muted-foreground py-12">لا توجد إحصائيات للفرق بعد.</p>}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Stats;
