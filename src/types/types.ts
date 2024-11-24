// types.ts

export interface Room {
    id: number;
    numero: number;
    tipo: string;
    precio: number;
    estado: 'Libre' | 'Ocupado';
    descripcion: string;
    numero_camas: number;
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
}

export interface ReservaData {
    nombre: string;
    apellido: string;
    email: string; 
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
}