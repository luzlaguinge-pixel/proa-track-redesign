export type TeamMember = {
  id: string;
  nombre: string;
  dni: string;
  telefono: string;
  email: string;
  puesto: string;
  pais: 'AR' | 'GT' | 'UY';
  materialesCount: number;
};
