import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

export interface ShoppingItem {
  id: number;
  nome: string;
  quantidade: number;
  comprado: boolean;
  categoria: string;   // <-- NOVO
}

@Injectable({
  providedIn: 'root',
})
export class ShoppingListService {
  private storageReady = false;
  private lista: ShoppingItem[] = [];
  private readonly STORAGE_KEY = 'lista_compras';

  constructor(private storage: Storage) {
    this.init();
  }

  private async init() {
    await this.storage.create();
    this.storageReady = true;

    const saved = await this.storage.get(this.STORAGE_KEY);
    if (saved) {
      this.lista = saved;
    }
  }

  getItens(): ShoppingItem[] {
    return this.lista;
  }

  async adicionar(nome: string, quantidade: number = 1, categoria: string = 'Geral') {
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

  private async salvar() {
    if (!this.storageReady) return;
    await this.storage.set(this.STORAGE_KEY, this.lista);
  }
}
