import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Plus, Pencil, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPlayers, addPlayer, updatePlayer, deletePlayer } from "@/lib/store";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const Players = () => {
  const [players, setPlayers] = useState<any[]>([]);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setPlayers(await getPlayers());
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    try {
      await addPlayer(newName);
      setNewName("");
      await refresh();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleUpdate = async () => {
    if (!editingId || !editName.trim()) return;
    try {
      await updatePlayer(editingId, editName);
      setEditingId(null);
      await refresh();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePlayer(deleteId);
      setDeleteId(null);
      await refresh();
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="min-h-screen">
      <div className="bg-table-green px-5 pt-10 pb-6">
        <Link to="/" className="text-table-green-foreground/70 inline-flex items-center gap-1 text-sm mb-4">
          <ArrowRight className="h-4 w-4" /> الرئيسية
        </Link>
        <h1 className="text-2xl font-black text-table-green-foreground">إدارة اللاعبين</h1>
      </div>

      <div className="px-5 py-4">
        <div className="flex gap-2 mb-6">
          <Input placeholder="اسم اللاعب الجديد..." value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAdd()} className="flex-1" />
          <Button onClick={handleAdd} size="icon" className="bg-accent text-accent-foreground shrink-0"><Plus className="h-5 w-5" /></Button>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground py-8">جارٍ التحميل...</p>
        ) : (
          <div className="space-y-2">
            {players.map(player => (
              <div key={player.id} className="bg-card rounded-lg p-4 card-shadow flex items-center gap-3">
                <div className="bg-primary/10 rounded-full p-2"><User className="h-5 w-5 text-primary" /></div>
                {editingId === player.id ? (
                  <div className="flex-1 flex gap-2">
                    <Input value={editName} onChange={e => setEditName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleUpdate()} className="flex-1" autoFocus />
                    <Button size="sm" onClick={handleUpdate}>حفظ</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>إلغاء</Button>
                  </div>
                ) : (
                  <>
                    <span className="flex-1 font-semibold text-card-foreground">{player.name}</span>
                    <button onClick={() => { setEditingId(player.id); setEditName(player.name); }} className="text-muted-foreground hover:text-foreground p-1"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => setDeleteId(player.id)} className="text-muted-foreground hover:text-destructive p-1"><Trash2 className="h-4 w-4" /></button>
                  </>
                )}
              </div>
            ))}
            {players.length === 0 && <p className="text-center text-muted-foreground py-8">لا يوجد لاعبون بعد. أضف لاعبين للبدء!</p>}
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف اللاعب</AlertDialogTitle>
            <AlertDialogDescription>هل أنت متأكد؟ سيتم حذف اللاعب ولكن ستبقى المباريات السابقة محفوظة.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Players;
