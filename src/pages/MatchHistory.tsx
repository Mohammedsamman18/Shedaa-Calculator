import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Trophy, Calendar } from "lucide-react";
import { getMatches, getPlayers, getMatchScores } from "@/lib/store";

const MatchHistory = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [scores, setScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getName = (id: string) => players.find(p => p.id === id)?.name || "؟";

  useEffect(() => {
    Promise.all([getMatches(), getPlayers()]).then(([m, p]) => {
      setMatches(m.filter(x => x.winner_team !== null));
      setPlayers(p);
      setLoading(false);
    });
  }, []);

  const handleExpand = async (matchId: string) => {
    if (expanded === matchId) { setExpanded(null); return; }
    setExpanded(matchId);
    const s = await getMatchScores(matchId);
    setScores(s);
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">جارٍ التحميل...</div>;

  return (
    <div className="min-h-screen">
      <div className="bg-table-green px-5 pt-10 pb-6">
        <Link to="/" className="text-table-green-foreground/70 inline-flex items-center gap-1 text-sm mb-4"><ArrowRight className="h-4 w-4" /> الرئيسية</Link>
        <h1 className="text-2xl font-black text-table-green-foreground">سجل المباريات</h1>
      </div>
      <div className="px-5 py-4 space-y-3">
        {matches.map(match => {
          const team1Names = `${getName(match.team1_player1_id)} و ${getName(match.team1_player2_id)}`;
          const team2Names = `${getName(match.team2_player1_id)} و ${getName(match.team2_player2_id)}`;
          const isExpanded = expanded === match.id;
          return (
            <button key={match.id} onClick={() => handleExpand(match.id)} className="w-full text-right bg-card rounded-xl p-4 card-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground"><Calendar className="h-3 w-3" />{formatDate(match.created_at)}</div>
                {match.is_extended && <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full font-semibold">تمديد</span>}
              </div>
              <div className="flex items-center justify-between">
                <div className={`flex-1 ${match.winner_team === 1 ? "font-bold" : ""}`}>
                  <p className="text-sm text-card-foreground">{team1Names}</p>
                  <p className="text-2xl font-black text-primary">{match.team1_total}</p>
                </div>
                <div className="px-3"><span className="text-muted-foreground font-bold">vs</span></div>
                <div className={`flex-1 text-left ${match.winner_team === 2 ? "font-bold" : ""}`}>
                  <p className="text-sm text-card-foreground">{team2Names}</p>
                  <p className="text-2xl font-black text-primary">{match.team2_total}</p>
                </div>
              </div>
              {match.winner_team && (
                <div className="mt-2 flex items-center gap-1 text-xs text-success font-semibold">
                  <Trophy className="h-3 w-3" /> الفائز: {match.winner_team === 1 ? team1Names : team2Names}
                </div>
              )}
              {isExpanded && scores.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">تفاصيل ({scores.length} إضافة):</p>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {scores.map((s, i) => (
                      <div key={s.id} className="flex justify-between text-xs">
                        <span className="text-muted-foreground">الجولة {i + 1}</span>
                        <span className={s.team === 1 ? "text-destructive" : "text-primary"}>{s.team === 1 ? "🔴" : "🔵"} +{s.points}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </button>
          );
        })}
        {matches.length === 0 && <p className="text-center text-muted-foreground py-12">لا توجد مباريات مسجلة بعد.</p>}
      </div>
    </div>
  );
};

export default MatchHistory;
