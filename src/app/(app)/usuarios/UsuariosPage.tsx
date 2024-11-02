"use client";
import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Popconfirm, message, Alert, Spin, Empty } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import UserService from '@/services/UsersService';
import { useRouter } from 'next/navigation';
import type { ColumnsType } from 'antd/es/table';
import UserModal from '@/components/UserModal';
import { User } from '@/types/types';

interface UsersPageProps {
  token: string;
  role: string;
}

const UsersPage: React.FC<UsersPageProps> = ({ token, role }) => {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  useEffect(() => {
    if (token) {
      if (role === 'admin') {
        const fetchUsers = async () => {
          try {
            const usersData = await UserService.getAllUsers(token);
            setUsers(usersData);
            setFilteredUsers(usersData);
            setLoading(false);
          } catch (error) {
            setError('Error al obtener los usuarios');
            setLoading(false);
          }
        };
        fetchUsers();
      } else {
        // Redirigir si el usuario no es administrador
        message.error('Acceso denegado. Solo los administradores pueden acceder a esta página.');
        router.push('/dashboard');
      }
    }
  }, [token, role]);

  // Función para manejar la búsqueda global
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);

    const filtered = users.filter((user) =>
      user.first_name.toLowerCase().includes(value) ||
      user.last_name.toLowerCase().includes(value) ||
      user.email.toLowerCase().includes(value) ||
      user.role.toLowerCase().includes(value) ||
      user.status.toLowerCase().includes(value)
    );

    setFilteredUsers(filtered);
  };

  const handleDelete = async (userId: number) => {
    try {
      const admins = users.filter((user) => user.role === 'admin' && user.status === 'activo');
      if (admins.length === 1 && admins[0].id === userId) {
        message.warning('No se puede eliminar el único administrador activo.');
        return;
      }

      if (token) {
        await UserService.deleteUser(userId, token);
        message.success('Usuario eliminado exitosamente');
        setUsers(users.filter((user) => user.id !== userId));
        setFilteredUsers(filteredUsers.filter((user) => user.id !== userId));
      }
    } catch (error) {
      message.error('Error al eliminar el usuario');
    }
  };

  const handleEdit = (user: User) => {
    // Verificar si solo queda un administrador activo
    const admins = users.filter((user) => user.role === 'admin' && user.status === 'activo');
    if (admins.length === 1 && admins[0].id === user.id) {
      message.warning('No se puede editar el único administrador activo.');
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
    try {
      if (token && selectedUser) {
        const updated = await UserService.updateUser(selectedUser.id, updatedUser, token);
        message.success('Usuario actualizado exitosamente');

        setUsers(users.map((user) => (user.id === updated.id ? updated : user)));
        setFilteredUsers(filteredUsers.map((user) => (user.id === updated.id ? updated : user)));

        setIsModalVisible(false);
        setSelectedUser(null);
      }
    } catch (error) {
      message.error('Error al actualizar el usuario');
    }
  };

  const handleCreateUser = async (newUser: Partial<User>) => {
    try {
      if (token) {
        const createdUser = await UserService.createUser(newUser, token);
        message.success('Usuario creado exitosamente');

        setUsers([...users, createdUser]);
        setFilteredUsers([...filteredUsers, createdUser]);

        setIsModalVisible(false);
      }
    } catch (error) {
      message.error('Error al crear el usuario');
    }
  };

  if (loading) {
    return <Spin />;
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  const columns: ColumnsType<User> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Nombre',
      dataIndex: 'first_name',
      key: 'first_name',
    },
    {
      title: 'Apellido',
      dataIndex: 'last_name',
      key: 'last_name',
    },
    {
      title: 'Nombre de Usuario',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Correo Electrónico',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Rol',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (status === 'activo' ? 'Activo' : 'Inactivo'),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, user) => (
        <div className="flex space-x-3">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(user)}>
            Editar
          </Button>
          <Popconfirm
            title="¿Estás seguro de eliminar este usuario?"
            onConfirm={() => handleDelete(user.id)}
            okText="Sí"
            cancelText="No"
            placement="left"
          >
            <Button danger icon={<DeleteOutlined />}>
              Eliminar
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Lista de Usuarios</h1>
      <div className="mb-4 flex justify-between items-center space-x-2">
        <Input
          placeholder="Buscar usuarios..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={handleSearch}
          style={{ width: 300 }}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Crear Usuario
        </Button>
      </div>
      {filteredUsers.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <Empty description="No existen usuarios" />
        </div>
      ) : (
        <Table
          dataSource={filteredUsers}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1000 }}
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
