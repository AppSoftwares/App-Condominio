-- Habilitar Realtime para la tabla de votos
-- Esto permite que los resultados se actualicen en vivo en la App.
ALTER PUBLICATION supabase_realtime ADD TABLE public.internal_votes;
