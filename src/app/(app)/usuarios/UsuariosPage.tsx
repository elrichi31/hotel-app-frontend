"use client";
import React, { useEffect, useMemo, useState, useTransition } from 'react';
import { Input, Button, Avatar, Tooltip, Select, SelectItem, Spinner } from '@heroui/react';
import {
  Search,
  Trash2,
  Pencil,
  Plus,
  Mail,
  ShieldCheck,
  User as UserIcon,
  Tag,
  BellRing,
} from 'lucide-react';
import UserService from '@/services/UsersService';
import { useRouter } from 'next/navigation';
import UserModal from '@/components/UserModal';
import { User } from '@/types/types';
import { notion, viz } from '@/lib/theme';
import { PageHeader } from '@/components/ui/PageHeader';
import { ColumnHeader } from '@/components/ui/ColumnHeader';
import { StatusPill } from '@/components/ui/StatusPill';
import { DataTable, DataTableColumn } from '@/components/ui/DataTable';
import { ActiveFilters, ActiveFilter } from '@/components/ui/ActiveFilters';
import { TablePagination, paginate, PaginationState } from '@/components/ui/TablePagination';
import { RowActionsMenu } from '@/components/ui/RowActionsMenu';
import { useSortedRows } from '@/lib/useSortedRows';
import { toast } from '@/lib/toast';

interface UsersPageProps {
  token: string;
  role: string;
}

const AVATAR_COLORS = [viz.series1, viz.series2, viz.series3];
/** Color estable por usuario (mismo id => mismo color siempre). */
const avatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];

const UsersPage: React.FC<UsersPageProps> = ({ token, role }) => {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState<string>('todos');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroNotif, setFiltroNotif] = useState<string>('todos');
  const [pagination, setPagination] = useState<PaginationState>({ current: 1, pageSize: 10 });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  useEffect(() => {
    if (!token) return;
    if (role !== 'admin') {
      toast.error('Acceso denegado. Solo los administradores pueden acceder a esta página.');
      router.push('/dashboard');
      return;
    }
    const fetchUsers = async () => {
      try {
        const usersData = await UserService.getAllUsers(token);
        setUsers(usersData);
      } catch {
        setError('Error al obtener los usuarios');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token, role, router]);

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return users.filter((u) => {
      if (filtroRol !== 'todos' && u.role !== filtroRol) return false;
      if (filtroEstado !== 'todos' && u.status !== filtroEstado) return false;
      if (filtroNotif !== 'todos' && (filtroNotif === 'si') !== !!u.notificar_reservas) return false;
      if (!q) return true;
      return (
        u.first_name.toLowerCase().includes(q) ||
        u.last_name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        u.status.toLowerCase().includes(q)
      );
    });
  }, [users, busqueda, filtroRol, filtroEstado, filtroNotif]);

  const soloAdminActivo = (userId: number) => {
    const admins = users.filter((u) => u.role === 'admin' && u.status === 'activo');
    return admins.length === 1 && admins[0].id === userId;
  };

  const handleDelete = async (userId: number) => {
    if (soloAdminActivo(userId)) {
      toast.warning('No se puede eliminar el único administrador activo.');
      return;
    }
    try {
      await UserService.deleteUser(userId, token);
      toast.success('Usuario eliminado exitosamente');
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch {
      toast.error('Error al eliminar el usuario');
    }
  };

  const handleEdit = (user: User) => {
    if (soloAdminActivo(user.id)) {
      toast.warning('No se puede editar el único administrador activo.');
      return;
    }
    setSelectedUser(user);
    setIsEditMode(true);
    setIsModalVisible(true);
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setIsEditMode(false);
    setIsModalVisible(true);
  };

  const handleUpdateUser = async (updatedUser: Partial<User>) => {
    if (!selectedUser) return;
    try {
      const updated = await UserService.updateUser(selectedUser.id, updatedUser, token);
      toast.success('Usuario actualizado exitosamente');
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setIsModalVisible(false);
      setSelectedUser(null);
    } catch {
      toast.error('Error al actualizar el usuario');
    }
  };

  const handleCreateUser = async (newUser: Partial<User>) => {
    try {
      const createdUser = await UserService.createUser(newUser, token);
      toast.success('Usuario creado exitosamente');
      setUsers((prev) => [...prev, createdUser]);
      setIsModalVisible(false);
    } catch {
      toast.error('Error al crear el usuario');
    }
  };

  const { sorted, sortDescriptor, setSortDescriptor } = useSortedRows<User>(
    visibles,
    { usuario: (a, b) => a.first_name.localeCompare(b.first_name) }
  );
  const pageItems = paginate(sorted, pagination);
  const filterChips: ActiveFilter[] = [
    ...(busqueda.trim() ? [{ key: 'search', label: `“${busqueda.trim()}”`, onClear: () => setBusqueda('') }] : []),
    ...(filtroRol !== 'todos' ? [{ key: 'rol', label: filtroRol === 'admin' ? 'Admin' : 'Empleado', onClear: () => setFiltroRol('todos') }] : []),
    ...(filtroEstado !== 'todos' ? [{ key: 'estado', label: filtroEstado === 'activo' ? 'Activo' : 'Inactivo', onClear: () => setFiltroEstado('todos') }] : []),
    ...(filtroNotif !== 'todos' ? [{ key: 'notif', label: filtroNotif === 'si' ? 'Recibe avisos' : 'No recibe avisos', onClear: () => setFiltroNotif('todos') }] : []),
  ];

  if (loading) return <Spinner />;
  if (error) return <div style={{ color: notion.red }}>{error}</div>;

  const columns: DataTableColumn<User>[] = [
    {
      // Nombre + apellido + usuario en una sola celda, como el perfil del sidebar
      key: 'usuario',
      header: <ColumnHeader icon={<ShieldCheck size={13} />}>Usuario</ColumnHeader>,
      allowsSorting: true,
      render: (u) => {
        const initials = `${u.first_name?.[0] ?? ''}${u.last_name?.[0] ?? ''}`.toUpperCase();
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar radius="sm" style={{ width: 30, height: 30, background: avatarColor(u.id), fontSize: 12, flexShrink: 0 }} name={initials || 'U'} />
            <div style={{ lineHeight: 1.3 }}>
              <div style={{ color: notion.ink }}>
                {u.first_name} {u.last_name}
              </div>
              <div style={{ fontSize: 12, color: notion.inkFaint }}>@{u.username}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'email',
      header: <ColumnHeader icon={<Mail size={13} />}>Correo</ColumnHeader>,
      render: (u) => <span style={{ color: notion.inkMuted }}>{u.email}</span>,
    },
    {
      key: 'role',
      header: <ColumnHeader icon={<Tag size={13} />}>Rol</ColumnHeader>,
      render: (u) => {
        const isAdmin = u.role === 'admin';
        const color = isAdmin ? viz.series1 : notion.inkMuted;
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color, fontSize: 13.5 }}>
            {isAdmin ? <ShieldCheck size={15} /> : <UserIcon size={15} />}
            {isAdmin ? 'Admin' : 'Usuario'}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Estado',
      render: (u) => (
        <StatusPill color={u.status === 'activo' ? viz.positive : viz.negative} label={u.status === 'activo' ? 'Activo' : 'Inactivo'} />
      ),
    },
    {
      key: 'notificar_reservas',
      header: <ColumnHeader icon={<BellRing size={13} />}>Avisos de reservas</ColumnHeader>,
      align: 'center',
      width: 130,
      render: (u) => (
        <Tooltip content={u.notificar_reservas ? 'Recibe correo cuando se crea una reserva' : 'No recibe avisos de nuevas reservas'}>
          <span style={{ display: 'inline-flex' }}>
            <BellRing size={15} color={u.notificar_reservas ? viz.series1 : notion.inkFaint} style={{ opacity: u.notificar_reservas ? 1 : 0.5 }} />
          </span>
        </Tooltip>
      ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      align: 'end',
      width: 90,
      render: (user) => (
        <RowActionsMenu
          actions={[
            { key: 'editar', label: 'Editar', icon: <Pencil size={14} />, onClick: () => handleEdit(user) },
            {
              key: 'eliminar',
              label: 'Eliminar',
              icon: <Trash2 size={14} />,
              danger: true,
              onClick: () => handleDelete(user.id),
              confirm: { title: '¿Eliminar este usuario?', okText: 'Eliminar' },
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      <PageHeader
        title="Usuarios"
        subtitle={
          <>
            <strong style={{ color: notion.ink }}>{users.length}</strong> cuentas registradas
          </>
        }
        action={
          <Button color="primary" startContent={<Plus size={16} />} onPress={handleCreate}>
            Crear usuario
          </Button>
        }
      />

      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <Input
          isClearable
          startContent={<Search size={14} color={notion.inkFaint} />}
          placeholder="Buscar por nombre, usuario, correo, rol o estado"
          value={busqueda}
          onValueChange={setBusqueda}
          className="max-w-xs"
        />
        <Select
          aria-label="Rol"
          placeholder="Rol"
          selectedKeys={[filtroRol]}
          onSelectionChange={(keys) => setFiltroRol(String(Array.from(keys as Set<React.Key>)[0] ?? 'todos'))}
          className="w-36"
          disallowEmptySelection
        >
          <SelectItem key="todos">Todos los roles</SelectItem>
          <SelectItem key="admin">Admin</SelectItem>
          <SelectItem key="empleado">Empleado</SelectItem>
        </Select>
        <Select
          aria-label="Estado"
          placeholder="Estado"
          selectedKeys={[filtroEstado]}
          onSelectionChange={(keys) => setFiltroEstado(String(Array.from(keys as Set<React.Key>)[0] ?? 'todos'))}
          className="w-36"
          disallowEmptySelection
        >
          <SelectItem key="todos">Todos los estados</SelectItem>
          <SelectItem key="activo">Activo</SelectItem>
          <SelectItem key="inactivo">Inactivo</SelectItem>
        </Select>
        <Select
          aria-label="Avisos"
          placeholder="Avisos"
          selectedKeys={[filtroNotif]}
          onSelectionChange={(keys) => setFiltroNotif(String(Array.from(keys as Set<React.Key>)[0] ?? 'todos'))}
          className="w-40"
          disallowEmptySelection
        >
          <SelectItem key="todos">Todos</SelectItem>
          <SelectItem key="si">Recibe avisos</SelectItem>
          <SelectItem key="no">No recibe</SelectItem>
        </Select>
      </div>

      <ActiveFilters filters={filterChips} />

      <DataTable<User>
        ariaLabel="Usuarios"
        columns={columns}
        rows={pageItems}
        isLoading={isPending}
        sortDescriptor={sortDescriptor}
        onSortChange={(d) => startTransition(() => setSortDescriptor(d))}
        emptyContent="No existen usuarios"
        bottomContent={
          visibles.length > 0 ? (
            <TablePagination
              totalItems={visibles.length}
              itemLabel="usuarios"
              pagination={pagination}
              onChange={(next) => startTransition(() => setPagination(next))}
            />
          ) : null
        }
      />

      <UserModal
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedUser(null);
        }}
        onOk={isEditMode ? handleUpdateUser : handleCreateUser}
        user={selectedUser}
        isEditMode={isEditMode}
      />
    </div>
  );
};

export default UsersPage;
