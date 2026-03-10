import { supabase } from "@/integrations/supabase/client";

// Players
export async function getPlayers() {
  const { data, error } = await supabase.from("players").select("*").order("created_at");
  if (error) throw error;
  return data || [];
}

export async function addPlayer(name: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await supabase.from("players").insert({ name: name.trim(), user_id: user.id }).select().single();
  if (error) throw error;
  return data;
}

export async function updatePlayer(id: string, name: string) {
  const { error } = await supabase.from("players").update({ name: name.trim() }).eq("id", id);
  if (error) throw error;
}

export async function deletePlayer(id: string) {
  const { error } = await supabase.from("players").delete().eq("id", id);
  if (error) throw error;
}

// Matches
export async function getMatches() {
  const { data, error } = await supabase.from("matches").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createMatch(team1: { player1Id: string; player2Id: string }, team2: { player1Id: string; player2Id: string }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await supabase.from("matches").insert({
    user_id: user.id,
    team1_player1_id: team1.player1Id,
    team1_player2_id: team1.player2Id,
    team2_player1_id: team2.player1Id,
    team2_player2_id: team2.player2Id,
  }).select().single();
  if (error) throw error;
  return data;
}

export async function updateMatch(id: string, updates: {
  team1_total?: number;
  team2_total?: number;
  winner_team?: number | null;
  is_extended?: boolean;
  completed_at?: string | null;
}) {
  const { error } = await supabase.from("matches").update(updates).eq("id", id);
  if (error) throw error;
}

export async function addScore(matchId: string, team: number, points: number) {
  const { error } = await supabase.from("match_scores").insert({ match_id: matchId, team, points });
  if (error) throw error;
}

export async function getMatchScores(matchId: string) {
  const { data, error } = await supabase.from("match_scores").select("*").eq("match_id", matchId).order("created_at");
  if (error) throw error;
  return data || [];
}

export async function deleteLastScore(matchId: string) {
  const { data } = await supabase.from("match_scores").select("id").eq("match_id", matchId).order("created_at", { ascending: false }).limit(1);
  if (data && data.length > 0) {
    await supabase.from("match_scores").delete().eq("id", data[0].id);
  }
}

// Stats
export async function getPlayerStats(playerId: string) {
  const matches = await getMatches();
  const completed = matches.filter(m => m.winner_team !== null);
  let wins = 0, losses = 0, totalPoints = 0, matchCount = 0;

  for (const m of completed) {
    const inTeam1 = m.team1_player1_id === playerId || m.team1_player2_id === playerId;
    const inTeam2 = m.team2_player1_id === playerId || m.team2_player2_id === playerId;
    if (!inTeam1 && !inTeam2) continue;
    matchCount++;
    const playerTeam = inTeam1 ? 1 : 2;
    if (m.winner_team === playerTeam) wins++;
    else losses++;
    totalPoints += playerTeam === 1 ? m.team1_total : m.team2_total;
  }

  return { wins, losses, matchCount, avgPoints: matchCount ? Math.round(totalPoints / matchCount) : 0 };
}

export async function getTeamStats() {
  const matches = await getMatches();
  const completed = matches.filter(m => m.winner_team !== null);
  const teamMap: Record<string, { player1Id: string; player2Id: string; wins: number; losses: number; matches: number }> = {};

  for (const m of completed) {
    for (const teamNum of [1, 2] as const) {
      const p1 = teamNum === 1 ? m.team1_player1_id : m.team2_player1_id;
      const p2 = teamNum === 1 ? m.team1_player2_id : m.team2_player2_id;
      const key = [p1, p2].sort().join("_");
      if (!teamMap[key]) teamMap[key] = { player1Id: p1, player2Id: p2, wins: 0, losses: 0, matches: 0 };
      teamMap[key].matches++;
      if (m.winner_team === teamNum) teamMap[key].wins++;
      else teamMap[key].losses++;
    }
  }

  return Object.values(teamMap).sort((a, b) => b.wins - a.wins);
}
