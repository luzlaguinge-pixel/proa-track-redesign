import { type CatalogCategoria, type CatalogItem } from './types';

export const CATEGORIA_LABEL: Record<CatalogCategoria, string> = {
  dispositivos: 'Dispositivos',
  indumentaria: 'Indumentaria',
  accesorios: 'Accesorios',
};

export const CATEGORIAS: CatalogCategoria[] = [
  'dispositivos',
  'indumentaria',
  'accesorios',
];

export const SEED_CATALOG: CatalogItem[] = [
  {
    id: 'cat_celular',
    nombre: 'Celular',
    categoria: 'dispositivos',
    duenoPorDefecto: 'proa',
    requiereNumeroSerie: true,
    archivado: false,
  },
  {
    id: 'cat_tablet',
    nombre: 'Tablet',
    categoria: 'dispositivos',
    duenoPorDefecto: 'proa',
    requiereNumeroSerie: true,
    archivado: false,
  },
  {
    id: 'cat_cargador',
    nombre: 'Cargador',
    categoria: 'dispositivos',
    duenoPorDefecto: 'proa',
    requiereNumeroSerie: false,
    archivado: false,
  },
  {
    id: 'cat_pechera',
    nombre: 'Pechera',
    categoria: 'indumentaria',
    duenoPorDefecto: 'proa',
    requiereNumeroSerie: false,
    archivado: false,
  },
  {
    id: 'cat_tira_credencial',
    nombre: 'Tira credencial',
    categoria: 'indumentaria',
    duenoPorDefecto: 'cliente',
    requiereNumeroSerie: false,
    archivado: false,
  },
  {
    id: 'cat_filmina',
    nombre: 'Filmina',
    categoria: 'indumentaria',
    duenoPorDefecto: 'cliente',
    requiereNumeroSerie: false,
    archivado: false,
  },
  {
    id: 'cat_gorra',
    nombre: 'Gorra',
    categoria: 'indumentaria',
    duenoPorDefecto: 'cliente',
    requiereNumeroSerie: false,
    archivado: false,
  },
  {
    id: 'cat_remera',
    nombre: 'Remera',
    categoria: 'indumentaria',
    duenoPorDefecto: 'proa',
    requiereNumeroSerie: false,
    archivado: false,
  },
  {
    id: 'cat_funda',
    nombre: 'Funda',
    categoria: 'accesorios',
    duenoPorDefecto: 'proa',
    requiereNumeroSerie: false,
    archivado: false,
  },
  {
    id: 'cat_banner',
    nombre: 'Banner',
    categoria: 'accesorios',
    duenoPorDefecto: 'cliente',
    requiereNumeroSerie: false,
    archivado: false,
  },
  {
    id: 'cat_otro',
    nombre: 'Otro',
    categoria: 'accesorios',
    duenoPorDefecto: 'proa',
    requiereNumeroSerie: false,
    archivado: false,
  },
];
