-- Adicionar política de DELETE para superadmin na tabela lancamentos_historico
-- Esta política permite que apenas superadmins possam limpar os logs de auditoria

CREATE POLICY "Superadmin can delete historico"
ON public.lancamentos_historico
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'superadmin'
  )
);
