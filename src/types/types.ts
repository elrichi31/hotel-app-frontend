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
    email: string;
    telefono: string; 
    direccion: string;
    identificacion: string;
}