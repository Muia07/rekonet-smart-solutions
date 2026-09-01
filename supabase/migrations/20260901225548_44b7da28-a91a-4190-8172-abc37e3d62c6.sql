INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM auth.users WHERE email = 'evan.mwangi@outlook.com'
ON CONFLICT (user_id, role) DO NOTHING;

DELETE FROM public.app_downloads WHERE coalesce(file_url, '') = '';

UPDATE public.app_downloads SET is_active = false, updated_at = now()
WHERE file_url NOT ILIKE 'http%';