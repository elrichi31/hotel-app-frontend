"use client";
import React, { useEffect, useMemo, useState, useTransition } from 'react';
import { Table, Input, Alert, Spin, Empty, Button, Avatar, Popconfirm, Tooltip } from 'antd';
import {
  Search,
  Trash2,
  Eye,
  Plus,
  Mail,
  ShieldCheck,
  User as UserIcon,
  Tag,
  BellRing,
} from 'lucide-react';
import UserService from '@/services/UsersService';
import { useRouter } from 'next/navigation';
import type { ColumnsType } from 'antd/es/table';
import UserModal from '@/components/UserModal';
import { User } from '@/types/types';
import { notion, viz } from '@/lib/theme';
import { PageHeader } from '@/components/ui/PageHeader';
import { ColumnHeader } from '@/components/ui/ColumnHeader';
import { StatusPill } from '@/components/ui/StatusPill';
import { PageSizeSelect } from '@/components/ui/PageSizeSelect';
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
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
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
    if (!q) return users;
    return users.filter(
      (u) =>
        u.first_name.toLowerCase().includes(q) ||
        u.last_name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        u.status.toLowerCase().includes(q)
    );
  }, [users, busqueda]);

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

  if (loading) return <Spin />;
  if (error) return <Alert message="Error" description={error} type="error" showIcon />;

  const columns: ColumnsType<User> = [
    {
      // Nombre + apellido + usuario en una sola celda, como el perfil del sidebar
      title: <ColumnHeader icon={<ShieldCheck size={13} />}>Usuario</ColumnHeader>,
      key: 'usuario',
      sorter: (a, b) => a.first_name.localeCompare(b.first_name),
      render: (_, u) => {
        const initials = `${u.first_name?.[0] ?? ''}${u.last_name?.[0] ?? ''}`.toUpperCase();
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar shape="square" size={30} style={{ background: avatarColor(u.id), fontSize: 12, flexShrink: 0 }}>
              {initials || 'U'}
            </Avatar>
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
      title: <ColumnHeader icon={<Mail size={13} />}>Correo</ColumnHeader>,
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => <span style={{ color: notion.inkMuted }}>{email}</span>,
    },
    {
      title: <ColumnHeader icon={<Tag size={13} />}>Rol</ColumnHeader>,
      dataIndex: 'role',
      key: 'role',
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'Usuario', value: 'user' },
      ],
      onFilter: (value, record) => record.role === value,
      render: (role: string) => {
        const isAdmin = role === 'admin';
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
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Activo', value: 'activo' },
        { text: 'Inactivo', value: 'inactivo' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: string) => (
        <StatusPill color={status === 'activo' ? viz.positive : viz.negative} label={status === 'activo' ? 'Activo' : 'Inactivo'} />
      ),
    },
    {
      title: <ColumnHeader icon={<BellRing size={13} />}>Avisos de reservas</ColumnHeader>,
      dataIndex: 'notificar_reservas',
      key: 'notificar_reservas',
      align: 'center',
      width: 130,
      filters: [
        { text: 'Recibe avisos', value: 'si' },
        { text: 'No recibe', value: 'no' },
      ],
      onFilter: (value, record) => (value === 'si' ? !!record.notificar_reservas : !record.notificar_reservas),
      render: (notificar: boolean) => (
        <Tooltip title={notificar ? 'Recibe correo cuando se crea una reserva' : 'No recibe avisos de nuevas reservas'}>
          <BellRing size={15} color={notificar ? viz.series1 : notion.inkFaint} style={{ opacity: notificar ? 1 : 0.5 }} />
        </Tooltip>
      ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      align: 'right',
      width: 90,
      render: (_, user) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
          <Popconfirm
            title="¿Eliminar este usuario?"
            okText="Eliminar"
            cancelText="Cancelar"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(user.id)}
          >
            <Tooltip title="Eliminar">
              <button
                className="rounded-md transition-colors hover:bg-[rgba(255,255,255,0.06)]"
                style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', color: viz.negative, border: 'none', background: 'transparent', cursor: 'pointer' }}
              >
                <Trash2 size={15} />
              </button>
            </Tooltip>
          </Popconfirm>
          <Tooltip title="Editar">
            <button
              onClick={() => handleEdit(user)}
              className="rounded-md transition-colors hover:bg-[rgba(255,255,255,0.06)]"
              style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', color: notion.inkMuted, border: 'none', background: 'transparent', cursor: 'pointer' }}
            >
              <Eye size={15} />
            </button>
          </Tooltip>
        </div>
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
          <Button type="primary" icon={<Plus size={16} />} onClick={handleCreate}>
            Crear usuario
          </Button>
        }
      />

      <div style={{ marginBottom: 14 }}>
        <Input
          allowClear
          prefix={<Search size={14} color={notion.inkFaint} />}
          placeholder="Buscar por nombre, usuario, correo, rol o estado"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ maxWidth: 340 }}
        />
      </div>

      {visibles.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <Empty description="No existen usuarios" />
        </div>
      ) : (
        <Table<User>
          dataSource={visibles}
          columns={columns}
          rowKey="id"
          size="middle"
          sticky
          loading={isPending}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          pagination={{
            ...pagination,
            showSizeChanger: false,
            showTotal: (total, range) => (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
                Mostrando {range[0]} a {range[1]} de {total} usuarios
                <PageSizeSelect
                  value={pagination.pageSize}
                  onChange={(pageSize) => startTransition(() => setPagination({ current: 1, pageSize }))}
                />
              </span>
            ),
            onChange: (current, pageSize) => startTransition(() => setPagination({ current, pageSize })),
          }}
          scroll={{ x: 900 }}
        />
      )}

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
