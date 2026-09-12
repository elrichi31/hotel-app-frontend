'use client'
import React from 'react';
import { Card, CardHeader, CardBody, CardFooter, Button, Popover, PopoverTrigger, PopoverContent } from '@heroui/react';
import { Pencil, X, Receipt } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/lib/toast';

const VentaDetails = ({ venta, onDelete }: any) => {
  const handleDelete = () => {
    onDelete(venta.id);
    toast.success('Venta eliminada correctamente');
  };

  const renderPersonas = () => {
    const { personas } = venta;
    if (personas.length === 1) {
      return <p>{personas[0].nombre} {personas[0].apellido}</p>;
    } else {
      return (
        <p>
          {personas[0].nombre} {personas[0].apellido} {personas.length > 1 ? `+ ${personas.length - 1} persona${personas.length > 2 ? 's' : ''}` : ''}
        </p>
      );
    }
  };

  const renderHabitaciones = () => {
    const { precios } = venta;
    if (precios.length === 1) {
      return <p>Habitación {precios[0].habitacion.numero} ({precios[0].habitacion.tipo})</p>;
    } else {
      return (
        <p>
          Habitación {precios[0].habitacion.numero} ({precios[0].habitacion.tipo}) {precios.length > 1 ? `+ ${precios.length - 1} habitación${precios.length > 2 ? 'es' : ''}` : ''}
        </p>
      );
    }
  };

  return (
    <Card key={venta.id} className="mb-5 shadow-md">
      <CardHeader className="font-semibold">Venta #{venta.id}</CardHeader>
      <CardBody>
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Información de la Venta</h2>
          <p><strong>Fecha Inicio:</strong> {new Date(venta.fecha_inicio).toLocaleString()}</p>
          <p><strong>Fecha Fin:</strong> {new Date(venta.fecha_fin).toLocaleString()}</p>
          <p><strong>Descuento:</strong> ${venta.descuento}</p>
          <p><strong>Subtotal:</strong> ${venta.subtotal}</p>
          <p><strong>Total:</strong> ${venta.total}</p>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold">Personas</h2>
          {renderPersonas()}
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold">Habitaciones y Precios</h2>
          {renderHabitaciones()}
        </div>
      </CardBody>
      <CardFooter className="justify-end gap-2">
        <Button as={Link} href={`/ventas/${venta.id}`} isIconOnly variant="light" size="sm">
          <Pencil size={16} />
        </Button>
        <Button as={Link} href={`/ventas/facturas/${venta.id}`} isIconOnly variant="light" size="sm">
          <Receipt size={16} />
        </Button>
        <Popover placement="top">
          <PopoverTrigger>
            <Button isIconOnly variant="light" color="danger" size="sm">
              <X size={16} />
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="p-2">
              <div className="text-sm font-medium mb-2">¿Estás seguro de eliminar esta venta?</div>
              <div className="flex justify-end gap-2">
                <Button size="sm" color="danger" onPress={handleDelete}>
                  Sí
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </CardFooter>
    </Card>
  );
};

export default VentaDetails;
