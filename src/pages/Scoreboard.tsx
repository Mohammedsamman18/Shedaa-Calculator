import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Undo2, Trophy, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WINNING_SCORE } from "@/lib/types";
import { getPlayers, createMatch, updateMatch, addScore, deleteLastScore, getMatchScores } from "@/lib/store";
import {
  AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const QUICK_POINTS = [20, 40, 60, 80, 100];

interface MatchState {
  id: string;
  team1: { player1Id: string; player2Id: string };
  team2: { player1Id: string; player2Id: string };
  team1Total: number;
  team2Total: number;
  winnerId: number | null;
  isExtended: boolean;
  scores: { team: number; points: number }[];
}

const Scoreboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const matchSetup = location.state as { team1: { player1Id: string; player2Id: string }; team2: { player1Id: string; player2Id: string } } | null;

  const [players, setPlayers] = useState<any[]>([]);
  const [match, setMatch] = useState<MatchState | null>(null);
  const [customValue, setCustomValue] = useState("");
  const [activeTeam, setActiveTeam] = useState<1 | 2>(1);
  const [winDialog, setWinDialog] = useState<{ winner: number; extended: boolean } | null>(null);
  const [saving, setSaving] = useState(false);

  const getName = (id: string) => players.find(p => p.id === id)?.name || "؟";

  useEffect(() => {
    if (!matchSetup) { navigate("/"); return; }
    const init = async () => {
      const p = await getPlayers();
      setPlayers(p);
      const dbMatch = await createMatch(matchSetup.team1, matchSetup.team2);
      setMatch({
        id: dbMatch.id,
        team1: matchSetup.team1,
        team2: matchSetup.team2,
        team1Total: 0, team2Total: 0, winnerId: null, isExtended: false, scores: [],
      });
    };
    init().catch(e => { toast.error(e.message); navigate("/"); });
  }, []);

  const checkWin = useCallback((m: MatchState): MatchState => {
    const t1 = m.team1Total >= WINNING_SCORE;
    const t2 = m.team2Total >= WINNING_SCORE;
    if (t1 && t2) {
      if (m.team1Total !== m.team2Total) {
        const winner = m.team1Total > m.team2Total ? 1 : 2;
        setWinDialog({ winner, extended: true });
        return { ...m, winnerId: winner, isExtended: true };
      }
      return { ...m, isExtended: true };
    }
    if (t1) { setWinDialog({ winner: 1, extended: false }); return { ...m, winnerId: 1 }; }
    if (t2) { setWinDialog({ winner: 2, extended: false }); return { ...m, winnerId: 2 }; }
    return m;
  }, []);

  const addPoints = async (team: 1 | 2, points: number) => {
    if (!match || match.winnerId || saving) return;
    setSaving(true);
    try {
      await addScore(match.id, team, points);
      let updated: MatchState = {
        ...match,
        scores: [...match.scores, { team, points }],
        team1Total: match.team1Total + (team === 1 ? points : 0),
        team2Total: match.team2Total + (team === 2 ? points : 0),
      };
      updated = checkWin(updated);
      if (updated.winnerId) {
        await updateMatch(match.id, {
          team1_total: updated.team1Total,
          team2_total: updated.team2Total,
          winner_team: updated.winnerId,
          is_extended: updated.isExtended,
          completed_at: new Date().toISOString(),
        });
      } else {
        await updateMatch(match.id, {
          team1_total: updated.team1Total,
          team2_total: updated.team2Total,
          is_extended: updated.isExtended,
        });
      }
      setMatch(updated);
    } catch (e: any) { toast.error(e.message); }
    setSaving(false);
  };

  const undo = async () => {
    if (!match || match.scores.length === 0 || match.winnerId || saving) return;
    setSaving(true);
    try {
      await deleteLastScore(match.id);
      const scores = [...match.scores];
      const last = scores.pop()!;
      const updated: MatchState = {
        ...match, scores,
        team1Total: match.team1Total - (last.team === 1 ? last.points : 0),
        team2Total: match.team2Total - (last.team === 2 ? last.points : 0),
        isExtended: false,
      };
      await updateMatch(match.id, { team1_total: updated.team1Total, team2_total: updated.team2Total, is_extended: false });
      setMatch(updated);
    } catch (e: any) { toast.error(e.message); }
    setSaving(false);
  };

  const handleCustomAdd = () => {
    const val = parseInt(customValue);
    if (val > 0) { addPoints(activeTeam, val); setCustomValue(""); }
  };

  if (!match) return null;

  const team1Names = `${getName(match.team1.player1Id)} و ${getName(match.team1.player2Id)}`;
  const team2Names = `${getName(match.team2.player1Id)} و ${getName(match.team2.player2Id)}`;

  return (
    <div className="min-h-screen bg-table-green">
      {match.isExtended && !match.winnerId && (
        <div className="bg-accent text-accent-foreground text-center py-2 font-bold text-sm flex items-center justify-center gap-2">
          <AlertTriangle className="h-4 w-4" /> تمديد! كلا الفريقين تجاوزا {WINNING_SCORE}
        </div>
      )}

      <div className="px-4 pt-8 pb-4">
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setActiveTeam(1)} className={`rounded-xl p-5 text-center transition-all ${activeTeam === 1 ? "bg-card ring-2 ring-accent card-shadow" : "bg-card/50"}`}>
            <p className="text-xs text-muted-foreground mb-1">🔴 الفريق الأول</p>
            <p className="text-sm font-semibold text-card-foreground truncate">{team1Names}</p>
            <p className="text-5xl font-black text-primary mt-3">{match.team1Total}</p>
            <div className="h-1.5 bg-muted rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${Math.min(100, (match.team1Total / WINNING_SCORE) * 100)}%` }} />
            </div>
          </button>
          <button onClick={() => setActiveTeam(2)} className={`rounded-xl p-5 text-center transition-all ${activeTeam === 2 ? "bg-card ring-2 ring-accent card-shadow" : "bg-card/50"}`}>
            <p className="text-xs text-muted-foreground mb-1">🔵 الفريق الثاني</p>
            <p className="text-sm font-semibold text-card-foreground truncate">{team2Names}</p>
            <p className="text-5xl font-black text-primary mt-3">{match.team2Total}</p>
            <div className="h-1.5 bg-muted rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(100, (match.team2Total / WINNING_SCORE) * 100)}%` }} />
            </div>
          </button>
        </div>
      </div>

      {!match.winnerId && (
        <div className="px-4 pb-6">
          <p className="text-table-green-foreground/70 text-center text-sm mb-3">
            إضافة نقاط لـ {activeTeam === 1 ? "الفريق الأول 🔴" : "الفريق الثاني 🔵"}
          </p>
          <div className="grid grid-cols-5 gap-2 mb-3">
            {QUICK_POINTS.map(p => (
              <Button key={p} onClick={() => addPoints(activeTeam, p)} variant="secondary" className="font-bold text-lg py-6" disabled={saving}>+{p}</Button>
            ))}
          </div>
          <div className="flex gap-2 mb-4">
            <Input type="number" placeholder="قيمة مخصصة" value={customValue} onChange={e => setCustomValue(e.target.value)} onKeyDown={e => e.key === "Enter" && handleCustomAdd()} className="flex-1 bg-card" />
            <Button onClick={handleCustomAdd} className="bg-accent text-accent-foreground font-bold" disabled={saving}>إضافة</Button>
          </div>
          <Button onClick={undo} variant="outline" className="w-full border-table-green-foreground/20 text-table-green-foreground" disabled={match.scores.length === 0 || saving}>
            <Undo2 className="h-4 w-4 ml-2" /> تراجع
          </Button>
        </div>
      )}

      <AlertDialog open={!!winDialog} onOpenChange={() => {}}>
        <AlertDialogContent className="text-center">
          <AlertDialogHeader>
            <div className="flex justify-center mb-2"><Trophy className="h-16 w-16 text-accent" /></div>
            <AlertDialogTitle className="text-2xl">🎉 {winDialog?.winner === 1 ? team1Names : team2Names} فازوا!</AlertDialogTitle>
            <AlertDialogDescription className="text-lg">
              {match.team1Total} - {match.team2Total}
              {winDialog?.extended && <span className="block text-sm text-accent mt-1">بعد التمديد!</span>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
            <AlertDialogAction onClick={() => navigate("/history")} className="w-full bg-primary text-primary-foreground">عرض السجل</AlertDialogAction>
            <AlertDialogAction onClick={() => navigate("/")} className="w-full bg-accent text-accent-foreground">الرئيسية</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Scoreboard;
