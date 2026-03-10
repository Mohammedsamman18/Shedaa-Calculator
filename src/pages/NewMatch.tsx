import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPlayers } from "@/lib/store";

const PlayerSelector = ({
  label, players, selected, onToggle, disabled,
}: {
  label: string; players: any[]; selected: string[]; onToggle: (id: string) => void; disabled: string[];
}) => (
  <div>
    <h3 className="font-bold text-card-foreground mb-3">{label}</h3>
    <div className="grid grid-cols-2 gap-2">
      {players.map(p => {
        const isSelected = selected.includes(p.id);
        const isDisabled = disabled.includes(p.id);
        return (
          <button key={p.id} onClick={() => !isDisabled && onToggle(p.id)} disabled={isDisabled}
            className={`rounded-lg p-3 text-sm font-semibold transition-all border-2 ${
              isSelected ? "border-accent bg-accent/10 text-accent-foreground"
              : isDisabled ? "border-border bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
              : "border-border bg-card text-card-foreground hover:border-accent/50"
            }`}>{p.name}</button>
        );
      })}
    </div>
    {selected.length < 2 && <p className="text-xs text-muted-foreground mt-2">اختر {2 - selected.length} لاعب{selected.length === 0 ? "ين" : ""}</p>}
  </div>
);

const NewMatch = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<any[]>([]);
  const [team1, setTeam1] = useState<string[]>([]);
  const [team2, setTeam2] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getPlayers().then(p => { setPlayers(p); setLoading(false); }); }, []);

  const toggle = (list: string[], setList: (v: string[]) => void) => (id: string) => {
    if (list.includes(id)) setList(list.filter(x => x !== id));
    else if (list.length < 2) setList([...list, id]);
  };

  const canStart = team1.length === 2 && team2.length === 2;

  const handleStart = () => {
    navigate("/scoreboard", { state: { team1: { player1Id: team1[0], player2Id: team1[1] }, team2: { player1Id: team2[0], player2Id: team2[1] } } });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">جارٍ التحميل...</div>;

  if (players.length < 4) {
    return (
      <div className="min-h-screen">
        <div className="bg-table-green px-5 pt-10 pb-6">
          <Link to="/" className="text-table-green-foreground/70 inline-flex items-center gap-1 text-sm mb-4"><ArrowRight className="h-4 w-4" /> الرئيسية</Link>
          <h1 className="text-2xl font-black text-table-green-foreground">مباراة جديدة</h1>
        </div>
        <div className="px-5 py-12 text-center">
          <p className="text-muted-foreground mb-4">تحتاج إلى 4 لاعبين على الأقل لبدء مباراة.</p>
          <Link to="/players"><Button className="bg-accent text-accent-foreground">إضافة لاعبين</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="bg-table-green px-5 pt-10 pb-6">
        <Link to="/" className="text-table-green-foreground/70 inline-flex items-center gap-1 text-sm mb-4"><ArrowRight className="h-4 w-4" /> الرئيسية</Link>
        <h1 className="text-2xl font-black text-table-green-foreground">مباراة جديدة</h1>
        <p className="text-table-green-foreground/70 text-sm mt-1">اختر لاعبي كل فريق</p>
      </div>
      <div className="px-5 py-6 space-y-6">
        <div className="bg-card rounded-xl p-5 card-shadow">
          <PlayerSelector label="🔴 الفريق الأول" players={players} selected={team1} onToggle={toggle(team1, setTeam1)} disabled={team2} />
        </div>
        <div className="flex justify-center"><div className="bg-accent rounded-full p-3"><Swords className="h-6 w-6 text-accent-foreground" /></div></div>
        <div className="bg-card rounded-xl p-5 card-shadow">
          <PlayerSelector label="🔵 الفريق الثاني" players={players} selected={team2} onToggle={toggle(team2, setTeam2)} disabled={team1} />
        </div>
        <Button onClick={handleStart} disabled={!canStart} className="w-full py-6 text-lg font-bold bg-primary text-primary-foreground">ابدأ المباراة</Button>
      </div>
    </div>
  );
};

export default NewMatch;
