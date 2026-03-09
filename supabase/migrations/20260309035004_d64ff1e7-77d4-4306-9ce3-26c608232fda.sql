INSERT INTO storage.buckets (id, name, public)
VALUES ('challenge-resources', 'challenge-resources', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view challenge resources"
ON storage.objects FOR SELECT
USING (bucket_id = 'challenge-resources');

CREATE POLICY "Admins can manage challenge resources"
ON storage.objects FOR ALL
USING (bucket_id = 'challenge-resources' AND public.is_admin(auth.uid()))
WITH CHECK (bucket_id = 'challenge-resources' AND public.is_admin(auth.uid()));