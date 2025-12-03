import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

export interface ShoppingItem {
  id: number;
  nome: string;
  quantidade: number;
  comprado: boolean;
  categoria: string;   // sempre terá alguma categoria
}

@Injectable({
  providedIn: 'root',
})
export class ShoppingListService {
  private storageReady = false;
  private lista: ShoppingItem[] = [];
  private readonly STORAGE_KEY = 'lista_compras';
  private readonly STORAGE_NAME_KEY = 'lista_compras_nome';

  private initPromise: Promise<void>;

  // nome da lista (default)
  private nomeLista: string = 'Lista de Compras';

  constructor(private storage: Storage) {
    this.initPromise = this.init();
  }

  private async init() {
    await this.storage.create();
    this.storageReady = true;

    const saved = await this.storage.get(this.STORAGE_KEY);
    if (saved) {
      this.lista = saved;
    }

    const savedName = await this.storage.get(this.STORAGE_NAME_KEY);
    if (savedName) {
      this.nomeLista = savedName;
    }
  }

  async ready(): Promise<void> {
    await this.initPromise;
  }

  // 🆕 nome da lista
  getNomeLista(): string {
    return this.nomeLista;
  }

  async setNomeLista(nome: string) {
    this.nomeLista = nome || 'Lista de Compras';
    if (!this.storageReady) return;
    await this.storage.set(this.STORAGE_NAME_KEY, this.nomeLista);
  }

  getItens(): ShoppingItem[] {
    return this.lista;
    // return [...this.lista];
  }

  async adicionar(
    nome: string,
    quantidade: number = 1,
    categoria: string = 'Geral'
  ) {
    const item: ShoppingItem = {
      id: Date.now(),
      nome,
      quantidade,
      comprado: false,
      categoria,
    };

    this.lista.push(item);
    await this.salvar();
  }

  async remover(id: number) {
    this.lista = this.lista.filter((i) => i.id !== id);
    await this.salvar();
  }

  async alternarComprado(id: number) {
    this.lista = this.lista.map((i) =>
      i.id === id ? { ...i, comprado: !i.comprado } : i
    );
    await this.salvar();
  }

  async limpar() {
    this.lista = [];
    await this.salvar();
  }

  async atualizar(
    id: number,
    dados: Partial<Pick<ShoppingItem, 'nome' | 'quantidade' | 'categoria'>>
  ) {
    this.lista = this.lista.map((i) => {
      if (i.id !== id) return i;

      return {
        ...i,
        nome: dados.nome !== undefined ? dados.nome : i.nome,
        quantidade:
          dados.quantidade !== undefined ? dados.quantidade : i.quantidade,
        categoria:
          dados.categoria !== undefined ? dados.categoria : i.categoria,
      };
    });

    await this.salvar();
  }

  private async salvar() {
    if (!this.storageReady) return;
    await this.storage.set(this.STORAGE_KEY, this.lista);
  }
}
