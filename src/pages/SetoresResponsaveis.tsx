import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, Pencil, Plus, Power, Trash2, Users2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useResponsavelSectors, type ResponsavelSector } from "@/hooks/useResponsavelSectors";
import { normalizeSetorResponsavelNome } from "@/utils/setoresResponsaveis";

const schema = z.object({
  nome: z
    .string()
    .transform((value) => normalizeSetorResponsavelNome(value))
    .refine((value) => value.length > 0, "Informe o nome do setor responsável."),
  ativo: z.boolean(),
});

type Values = z.infer<typeof schema>;

const defaultValues: Values = {
  nome: "",
  ativo: true,
};

export default function SetoresResponsaveis() {
  const { sectors, loading, saving, createSector, updateSector, toggleSector, deleteSector } =
    useResponsavelSectors({ includeInactive: true });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedSector, setSelectedSector] = useState<ResponsavelSector | null>(null);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const totals = useMemo(() => {
    const active = sectors.filter((sector) => sector.ativo).length;
    const vinculados = sectors.filter((sector) => sector.metasCount > 0 || sector.usersCount > 0).length;

    return {
      total: sectors.length,
      active,
      vinculados,
    };
  }, [sectors]);

  const openCreate = () => {
    setSelectedSector(null);
    form.reset(defaultValues);
    setDialogOpen(true);
  };

  const openEdit = (sector: ResponsavelSector) => {
    setSelectedSector(sector);
    form.reset({
      nome: sector.nome,
      ativo: sector.ativo,
    });
    setDialogOpen(true);
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    if (selectedSector) {
      await updateSector({
        id: selectedSector.id,
        currentName: selectedSector.nome,
        nome: values.nome,
        ativo: values.ativo,
        metasCount: selectedSector.metasCount,
        usersCount: selectedSector.usersCount,
      });
    } else {
      await createSector(values.nome);
    }

    setDialogOpen(false);
    setSelectedSector(null);
    form.reset(defaultValues);
  });

  const handleToggle = async (sector: ResponsavelSector) => {
    await toggleSector({
      id: sector.id,
      ativo: !sector.ativo,
      metasCount: sector.metasCount,
      usersCount: sector.usersCount,
    });
  };

  const handleDelete = async () => {
    if (!selectedSector) return;

    await deleteSector({
      id: selectedSector.id,
      metasCount: selectedSector.metasCount,
      usersCount: selectedSector.usersCount,
    });
    setDeleteOpen(false);
    setSelectedSector(null);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Setores Responsáveis</h1>
            <p className="mt-1 text-muted-foreground">
              Cadastre os setores usados nas metas do PAS e nos perfis dos usuários.
            </p>
          </div>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo setor
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totals.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totals.active}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Com vínculos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totals.vinculados}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users2 className="h-5 w-5" />
              Catálogo de Setores
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sectors.length === 0 ? (
              <div className="rounded-xl border border-dashed bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                Nenhum setor responsável cadastrado ainda.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Setor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Metas</TableHead>
                    <TableHead>Usuários</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sectors.map((sector) => (
                    <TableRow key={sector.id}>
                      <TableCell className="font-medium">{sector.nome}</TableCell>
                      <TableCell>
                        <Badge variant={sector.ativo ? "default" : "secondary"}>
                          {sector.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>{sector.metasCount}</TableCell>
                      <TableCell>{sector.usersCount}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(sector)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleToggle(sector)}>
                            <Power className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedSector(sector);
                              setDeleteOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedSector ? "Editar setor" : "Novo setor responsável"}</DialogTitle>
            <DialogDescription>
              Esse catálogo alimenta os selects de metas e usuários.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-5">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do setor</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Atenção Primária" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ativo"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-xl border p-4">
                    <div>
                      <FormLabel>Setor ativo</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Setores inativos deixam de aparecer nos selects de cadastro.
                      </p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={saving} className="gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir setor responsável</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja realmente excluir <strong>{selectedSector?.nome}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
