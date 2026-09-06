// types.ts

export interface RoomPrecio {
    id: number;
    numero_personas: number;
    precio: number;
}

export interface Room {
    id: number;
    numero: string;
    tipo: string;
    estado: 'Libre' | 'Ocupado';
    descripcion: string;
    numero_camas: number;
    precios: RoomPrecio[];
}

export interface ApiResponse<T> {
    data: T;
    status: number;
    message: string;
}

export interface Client {
    id: number;
    nombre: string;
    apellido: string;
    tipo_documento: string;
    numero_documento: string;
    ciudadania: string;
    procedencia: string
    isNew?: boolean;
}

export interface ReservaData {
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    fecha_inicio: string;
    fecha_fin: string;
    habitaciones: string[];
    precios: Record<string, number>;
    numero_personas: number;
    total: number;
    estado: string;
  }

export interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    username: string;
    token: string;
    role: string;
    status: string;
    notificar_reservas?: boolean;
}