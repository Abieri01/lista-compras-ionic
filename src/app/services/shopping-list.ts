import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

export interface ShoppingItem {
  id: number;
  nome: string;
  quantidade: number;
  comprado: boolean;
  categoria: string;   // sempre terá alguma categoria
}

export interface ShoppingList {
  id: number;
  nome: string;
  itens: ShoppingItem[];
}

@Injectable({
  providedIn: 'root',
})
export class ShoppingListService {
  private storageReady = false;

  // 🔹 Agora trabalhamos com VÁRIAS listas
  private listas: ShoppingList[] = [];
  private listaSelecionadaId: number | null = null;

  // chaves novas
  private readonly STORAGE_LISTS_KEY = 'listas_compras';
  private readonly STORAGE_CURRENT_LIST_ID_KEY = 'lista_compras_lista_atual';

  // chaves antigas (para migrar dados)
  private readonly LEGACY_ITEMS_KEY = 'lista_compras';
  private readonly LEGACY_NAME_KEY = 'lista_compras_nome';

  private initPromise: Promise<void>;

  constructor(private storage: Storage) {
    this.initPromise = this.init();
  }

  private async init() {
    await this.storage.create();
    this.storageReady = true;

    // 1) tentar carregar no formato NOVO (várias listas)
    const savedListas = await this.storage.get(this.STORAGE_LISTS_KEY);
    const savedCurrentId = await this.storage.get(
      this.STORAGE_CURRENT_LIST_ID_KEY
    );

    if (Array.isArray(savedListas) && savedListas.length > 0) {
      this.listas = savedListas;
      this.listaSelecionadaId =
        savedCurrentId ?? this.listas[0]?.id ?? null;
      return;
    }

    // 2) se não tiver no formato novo, tentar migrar do antigo (uma lista só)
    const legacyItems = await this.storage.get(this.LEGACY_ITEMS_KEY);
    const legacyName = await this.storage.get(this.LEGACY_NAME_KEY);

    const itens: ShoppingItem[] = Array.isArray(legacyItems)
      ? legacyItems
      : [];

    const nome = legacyName || 'Lista de Compras';

    const defaultList: ShoppingList = {
      id: Date.now(),
      nome,
      itens,
    };

    this.listas = [defaultList];
    this.listaSelecionadaId = defaultList.id;

    await this.salvar();
  }

  async ready(): Promise<void> {
    await this.initPromise;
  }

  // ---------------------------
  // Helpers internos
  // ---------------------------
  private get listaAtual(): ShoppingList | null {
    if (!this.listas.length) return null;

    let lista = this.listas.find((l) => l.id === this.listaSelecionadaId);
    if (!lista) {
      lista = this.listas[0];
      this.listaSelecionadaId = lista.id;
    }
    return lista;
  }

  private async salvar() {
    if (!this.storageReady) return;
    await this.storage.set(this.STORAGE_LISTS_KEY, this.listas);
    await this.storage.set(
      this.STORAGE_CURRENT_LIST_ID_KEY,
      this.listaSelecionadaId
    );
  }

  // ---------------------------
  // Listas
  // ---------------------------
  getListas(): ShoppingList[] {
    return this.listas;
  }

  getListaAtualId(): number | null {
    return this.listaSelecionadaId;
  }

  getNomeLista(): string {
    return this.listaAtual?.nome ?? 'Lista de Compras';
  }

  async setNomeLista(nome: string) {
    const lista = this.listaAtual;
    if (!lista) return;

    lista.nome = (nome || 'Lista de Compras').trim() || 'Lista de Compras';
    await this.salvar();
  }

  async selecionarLista(id: number) {
    if (this.listaSelecionadaId === id) return;
    const existe = this.listas.some((l) => l.id === id);
    if (!existe) return;

    this.listaSelecionadaId = id;
    await this.salvar();
  }

  async criarLista(nome: string): Promise<ShoppingList> {
    const lista: ShoppingList = {
      id: Date.now(),
      nome: (nome || 'Nova lista').trim() || 'Nova lista',
      itens: [],
    };

    this.listas.push(lista);
    this.listaSelecionadaId = lista.id;
    await this.salvar();

    return lista;
  }

  async removerLista(id: number) {
    // não permitir remover a última lista
    if (this.listas.length <= 1) return;

    this.listas = this.listas.filter((l) => l.id !== id);

    if (this.listaSelecionadaId === id) {
      this.listaSelecionadaId = this.listas[0]?.id ?? null;
    }

    await this.salvar();
  }

  // ---------------------------
  // Itens da lista ATUAL
  // ---------------------------
  getItens(): ShoppingItem[] {
    return this.listaAtual?.itens ?? [];
  }

  async adicionar(
    nome: string,
    quantidade: number = 1,
    categoria: string = 'Geral'
  ) {
    const lista = this.listaAtual;
    if (!lista) return;

    const item: ShoppingItem = {
      id: Date.now(),
      nome,
      quantidade,
      comprado: false,
      categoria,
    };

    lista.itens.push(item);
    await this.salvar();
  }

  async remover(id: number) {
    const lista = this.listaAtual;
    if (!lista) return;

    lista.itens = lista.itens.filter((i) => i.id !== id);
    await this.salvar();
  }

  async alternarComprado(id: number) {
    const lista = this.listaAtual;
    if (!lista) return;

    lista.itens = lista.itens.map((i) =>
      i.id === id ? { ...i, comprado: !i.comprado } : i
    );
    await this.salvar();
  }

  async limpar() {
    const lista = this.listaAtual;
    if (!lista) return;

    lista.itens = [];
    await this.salvar();
  }

  async atualizar(
    id: number,
    dados: Partial<Pick<ShoppingItem, 'nome' | 'quantidade' | 'categoria'>>
  ) {
    const lista = this.listaAtual;
    if (!lista) return;

    lista.itens = lista.itens.map((i) => {
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
}
