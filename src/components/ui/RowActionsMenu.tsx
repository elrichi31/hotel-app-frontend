"use client";
import React, { useRef, useState } from 'react';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, Popover, PopoverContent } from '@heroui/react';
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
 *
 * HeroUI no tiene un `Popconfirm` como antd: la confirmación se arma con un
 * `Popover` controlado, anclado al mismo botón de los tres puntos vía
 * `triggerRef`, que se abre cuando se elige una acción que pide confirmar.
 */
export function RowActionsMenu({ actions }: { actions: RowAction[] }) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [confirming, setConfirming] = useState<RowAction | null>(null);

  if (actions.length === 0) return null;

  return (
    <>
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <Button ref={triggerRef} isIconOnly variant="light" size="sm">
            <MoreHorizontal size={16} />
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Acciones"
          onAction={(key) => {
            const action = actions.find((a) => a.key === key);
            if (!action) return;
            if (action.confirm) setConfirming(action);
            else action.onClick();
          }}
        >
          {actions.map((a) => (
            <DropdownItem key={a.key} color={a.danger ? 'danger' : 'default'} startContent={a.icon}>
              {a.label}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>

      <Popover isOpen={!!confirming} onOpenChange={(open) => !open && setConfirming(null)} triggerRef={triggerRef} placement="left">
        {[
          <span key="trigger" style={{ display: 'none' }} />,
          <PopoverContent key="content">
            <div className="p-2 max-w-64">
              <div className="text-sm font-medium">{confirming?.confirm?.title}</div>
              {confirming?.confirm?.description && (
                <div className="text-xs text-default-400 mt-1">{confirming.confirm.description}</div>
              )}
              <div className="flex justify-end gap-2 mt-3">
                <Button size="sm" variant="light" onPress={() => setConfirming(null)}>
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  color={confirming?.danger ? 'danger' : 'primary'}
                  onPress={() => {
                    confirming?.onClick();
                    setConfirming(null);
                  }}
                >
                  {confirming?.confirm?.okText ?? 'Confirmar'}
                </Button>
              </div>
            </div>
          </PopoverContent>,
        ]}
      </Popover>
    </>
  );
}
