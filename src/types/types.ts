// types.ts

export interface Room {
    numero: number;
    tipo: string;
    precio: number;
    estado: 'Disponible' | 'Ocupado';
    descripcion: string;
    nuemro_camas: number;
}

export interface ApiResponse<T> {
    data: T;
    status: number;
    message: string;
}
