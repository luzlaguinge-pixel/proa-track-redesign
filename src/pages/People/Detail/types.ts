export type PersonDetail = {
  id: string;
  nombre: string;
  dni: string;
  telefono: string;
  email: string;
  puesto: string;
  pais: 'AR' | 'GT' | 'UY';
  jefeDirectoNombre: string | null;
};
