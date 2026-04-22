export type CatalogCategoria = 'dispositivos' | 'indumentaria' | 'accesorios';
export type CatalogDueno = 'proa' | 'cliente';

export type CatalogItem = {
  id: string;
  nombre: string;
  categoria: CatalogCategoria;
  duenoPorDefecto: CatalogDueno;
  requiereNumeroSerie: boolean;
  archivado: boolean;
};

export type CatalogItemWithUnidades = CatalogItem & { unidades: number };
