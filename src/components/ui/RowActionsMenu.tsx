"use client";
import React from 'react';
import { Dropdown, Button, Popconfirm } from 'antd';
import type { MenuProps } from 'antd';
import { MoreHorizontal } from 'lucide-react';

export type RowAction = {
  key: string;
  label: string;
  icon: React.ReactNode;
  danger?: boolean;
  onClick: () => void;
  /** Si se pasa, la acción pide confirmación antes de ejecutar `onClick`. */
  confirm?: { title: string; description?: string; okText?: string };
};

/**
 * Menú de acciones de fila con los tres puntos, en vez de varios íconos
 * sueltos: en pantallas angostas la columna de acciones se quedaba sin
 * espacio y los íconos terminaban recortados o desbordando la tabla.
 */
export function RowActionsMenu({ actions }: { actions: RowAction[] }) {
  if (actions.length === 0) return null;

  const items: MenuProps['items'] = actions.map((a) => ({
    key: a.key,
    danger: a.danger,
    icon: a.icon,
    label: a.confirm ? (
      // stopPropagation: sin esto, el propio Menu cierra el Dropdown al
      // detectar el click antes de que el Popconfirm alcance a abrirse.
      <span onClick={(e) => e.stopPropagation()}>
        <Popconfirm
          title={a.confirm.title}
          description={a.confirm.description}
          okText={a.confirm.okText ?? 'Confirmar'}
          cancelText="Cancelar"
          okButtonProps={{ danger: a.danger }}
          placement="left"
          onConfirm={a.onClick}
        >
          <span style={{ display: 'block' }}>{a.label}</span>
        </Popconfirm>
      </span>
    ) : (
      a.label
    ),
    onClick: a.confirm ? undefined : a.onClick,
  }));

  return (
    <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
      <Button
        type="text"
        size="small"
        icon={<MoreHorizontal size={16} />}
        onClick={(e) => e.stopPropagation()}
      />
    </Dropdown>
  );
}
