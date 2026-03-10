
-- Players table
CREATE TABLE public.players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own players" ON public.players FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own players" ON public.players FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own players" ON public.players FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own players" ON public.players FOR DELETE USING (auth.uid() = user_id);

-- Matches table
CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team1_player1_id UUID NOT NULL REFERENCES public.players(id),
  team1_player2_id UUID NOT NULL REFERENCES public.players(id),
  team2_player1_id UUID NOT NULL REFERENCES public.players(id),
  team2_player2_id UUID NOT NULL REFERENCES public.players(id),
  team1_total INTEGER NOT NULL DEFAULT 0,
  team2_total INTEGER NOT NULL DEFAULT 0,
  winner_team INTEGER, -- 1 or 2 or null (in progress)
  is_extended BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own matches" ON public.matches FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own matches" ON public.matches FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own matches" ON public.matches FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own matches" ON public.matches FOR DELETE USING (auth.uid() = user_id);

-- Match scores (individual score entries)
CREATE TABLE public.match_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  team INTEGER NOT NULL CHECK (team IN (1, 2)),
  points INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.match_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view scores of their matches" ON public.match_scores FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.matches WHERE matches.id = match_scores.match_id AND matches.user_id = auth.uid()));
CREATE POLICY "Users can insert scores to their matches" ON public.match_scores FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.matches WHERE matches.id = match_scores.match_id AND matches.user_id = auth.uid()));
CREATE POLICY "Users can delete scores of their matches" ON public.match_scores FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.matches WHERE matches.id = match_scores.match_id AND matches.user_id = auth.uid()));
