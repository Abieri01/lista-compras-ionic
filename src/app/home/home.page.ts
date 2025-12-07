import { ThemeService } from '../services/theme.service';
import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonList,
  IonItemSliding,
  IonCheckbox,
  IonItemOptions,
  IonItemOption,
  IonIcon,
  IonSelect,
  IonSelectOption,
  IonToggle,
  IonSearchbar,
} from '@ionic/angular/standalone';
import { CommonModule, NgIf, NgForOf, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShoppingListService, ShoppingItem } from '../services/shopping-list';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonList,
    IonItemSliding,
    IonCheckbox,
    IonItemOptions,
    IonItemOption,
    IonIcon,
    IonSelect,
    IonSelectOption,
    IonToggle,
    IonSearchbar,
    CommonModule,
    FormsModule,
    NgIf,
    NgForOf,
    NgClass,
  ],
})
export class HomePage implements OnInit {
  // formulário
  novoItemNome = '';
  novoItemQuantidade: number | null = 1;
  novaCategoria = 'Geral';

  // categorias
  categoriasPadrao: string[] = [
    'Hortifruti',
    'Açougue',
    'Padaria',
    'Bebidas',
    'Limpeza',
    'Higiene',
    'Congelados',
    'Geral',
  ];
  categoriasPersonalizadas: string[] = [];
  novaCategoriaPersonalizada = '';

  // filtros
  categoriaFiltro: string = 'Todas';
  mostrarSomenteNaoComprados = false;
  termoBusca: string = '';

  // lista
  lista: ShoppingItem[] = [];

  // nome da lista
  nomeLista: string = 'Lista de Compras';

  // multi-listas
  listas: { id: number; nome: string }[] = [];
  listaSelecionadaId: number | null = null;

  // tema
  temaEscuro: boolean = false;

  // visibilidade dos painéis
  filtrosVisiveis = false;
  adicionarVisivel = true; // deixa ligado por padrão

  constructor(
    private shoppingService: ShoppingListService,
    private alertController: AlertController,
    private themeService: ThemeService,
  ) {}

  async ngOnInit() {
    await this.shoppingService.ready();

    // Atualiza listas, itens e nome da lista selecionada
    this.atualizarListasEDados();

    // Tema salvo
    this.temaEscuro = this.themeService.carregarTema();
  }

  // abre/fecha painel de filtros
  abrirFiltros() {
    this.filtrosVisiveis = !this.filtrosVisiveis;
  }

  // abre/fecha painel de adicionar item
  abrirAdicionar() {
    this.adicionarVisivel = !this.adicionarVisivel;
  }

  alternarTema(event: any) {
    const enabled = event.detail.checked; // true/false do toggle
    this.temaEscuro = enabled;
    this.themeService.setDark(enabled);
  }

  // ---------------------------
  // CONTADORES
  // ---------------------------
  get totalItens(): number {
    return this.lista.length;
  }

  get totalNaoComprados(): number {
    return this.lista.filter((i) => !i.comprado).length;
  }

  get totalComprados(): number {
    return this.lista.filter((i) => i.comprado).length;
  }

  get totalUnidades(): number {
    return this.lista.reduce((acc, item) => acc + (item.quantidade || 0), 0);
  }

  // ---------------------------
  // CATEGORIAS
  // ---------------------------
  get categorias(): string[] {
    const set = new Set<string>([
      ...this.categoriasPadrao,
      ...this.categoriasPersonalizadas,
    ]);
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }

  // aplica APENAS filtro de categoria
  private filtrarPorCategoriaBase(): ShoppingItem[] {
    let itens = [...this.lista];
    if (this.categoriaFiltro !== 'Todas') {
      itens = itens.filter(
        (i) => (i.categoria || 'Geral') === this.categoriaFiltro
      );
    }
    return itens;
  }

  // lista principal (categoria + toggle + busca)
  get listaFiltrada(): ShoppingItem[] {
    let itens = this.filtrarPorCategoriaBase();

    if (this.mostrarSomenteNaoComprados) {
      itens = itens.filter((i) => !i.comprado);
    }

    if (this.termoBusca.trim()) {
      const termo = this.termoBusca.toLowerCase();
      itens = itens.filter((i) =>
        i.nome.toLowerCase().includes(termo)
      );
    }

    return itens;
  }

  // lista só de comprados
  get listaCompradosFiltrados(): ShoppingItem[] {
    if (this.mostrarSomenteNaoComprados) {
      return [];
    }

    let itens = this.filtrarPorCategoriaBase();
    itens = itens.filter((i) => i.comprado);

    if (this.termoBusca.trim()) {
      const termo = this.termoBusca.toLowerCase();
      itens = itens.filter((i) =>
        i.nome.toLowerCase().includes(termo)
      );
    }

    return itens;
  }

  // ---------------------------
  // AGRUPAMENTO POR CATEGORIA
  // ---------------------------
  get gruposPorCategoriaNaoComprados(): { categoria: string; itens: ShoppingItem[] }[] {
    const mapa = new Map<string, ShoppingItem[]>();

    const base = this.listaFiltrada.filter((i) => !i.comprado);

    for (const item of base) {
      const cat = item.categoria || 'Geral';
      if (!mapa.has(cat)) {
        mapa.set(cat, []);
      }
      mapa.get(cat)!.push(item);
    }

    const grupos = Array.from(mapa.entries()).map(([categoria, itens]) => ({
      categoria,
      itens,
    }));

    grupos.sort((a, b) =>
      a.categoria.localeCompare(b.categoria, 'pt-BR')
    );

    for (const g of grupos) {
      g.itens.sort((a, b) =>
        a.nome.toLowerCase().localeCompare(b.nome.toLowerCase(), 'pt-BR')
      );
    }

    return grupos;
  }

  get gruposPorCategoriaComprados(): { categoria: string; itens: ShoppingItem[] }[] {
    const mapa = new Map<string, ShoppingItem[]>();

    const base = this.listaCompradosFiltrados;

    for (const item of base) {
      const cat = item.categoria || 'Geral';
      if (!mapa.has(cat)) {
        mapa.set(cat, []);
      }
      mapa.get(cat)!.push(item);
    }

    const grupos = Array.from(mapa.entries()).map(([categoria, itens]) => ({
      categoria,
      itens,
    }));

    grupos.sort((a, b) =>
      a.categoria.localeCompare(b.categoria, 'pt-BR')
    );

    for (const g of grupos) {
      g.itens.sort((a, b) =>
        a.nome.toLowerCase().localeCompare(b.nome.toLowerCase(), 'pt-BR')
      );
    }

    return grupos;
  }

  // ---------------------------
  // ORDENAR LISTA
  // ---------------------------
  private ordenarLista() {
    this.lista.sort((a, b) => {
      const catA = (a.categoria || 'Geral').toLowerCase();
      const catB = (b.categoria || 'Geral').toLowerCase();

      if (catA < catB) return -1;
      if (catA > catB) return 1;

      const nomeA = a.nome.toLowerCase();
      const nomeB = b.nome.toLowerCase();

      if (nomeA < nomeB) return -1;
      if (nomeA > nomeB) return 1;

      return 0;
    });
  }

  // ---------------------------
  // ATUALIZAR LISTAS E DADOS
  // ---------------------------
  private atualizarListasEDados() {
    const listasService = this.shoppingService.getListas();
    this.listas = listasService.map((l) => ({
      id: l.id,
      nome: l.nome,
    }));

    this.listaSelecionadaId = this.shoppingService.getListaAtualId();
    this.lista = this.shoppingService.getItens();
    this.nomeLista = this.shoppingService.getNomeLista();
    this.ordenarLista();
  }

  async trocarLista() {
    if (this.listaSelecionadaId == null) return;

    await this.shoppingService.selecionarLista(this.listaSelecionadaId);
    this.atualizarListasEDados();
  }

  async novaLista() {
    const alert = await this.alertController.create({
      header: 'Nova lista',
      inputs: [
        {
          name: 'nome',
          type: 'text',
          placeholder: 'Ex: Mercado do mês, Farmácia...',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Criar',
          handler: async (data) => {
            const nome = (data.nome ?? '').trim();
            await this.shoppingService.criarLista(nome);
            this.atualizarListasEDados();
          },
        },
      ],
    });

    await alert.present();
  }

  // ---------------------------
  // AÇÕES DE ITENS
  // ---------------------------
  async adicionar() {
    const nome = this.novoItemNome.trim();
    const qtd = this.novoItemQuantidade ?? 1;
    const cat = this.novaCategoria || 'Geral';

    if (!nome) return;

    await this.shoppingService.adicionar(nome, qtd, cat);
    this.atualizarListasEDados();

    this.novoItemNome = '';
    this.novoItemQuantidade = 1;
    this.novaCategoria = 'Geral';
  }

  async remover(item: ShoppingItem) {
    const alert = await this.alertController.create({
      header: 'Remover item',
      message: `Deseja remover "<strong>${item.nome}</strong>" da lista?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Remover',
          role: 'destructive',
          handler: async () => {
            await this.shoppingService.remover(item.id);
            this.atualizarListasEDados();
          },
        },
      ],
    });

    await alert.present();
  }

  async alternarComprado(item: ShoppingItem) {
    await this.shoppingService.alternarComprado(item.id);
    this.atualizarListasEDados();
  }

  async limparTudo() {
    if (!this.lista.length) {
      return;
    }

    const alert = await this.alertController.create({
      header: 'Limpar tudo?',
      message: 'Isso vai apagar TODOS os itens da lista.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Limpar',
          role: 'destructive',
          handler: async () => {
            await this.shoppingService.limpar();
            this.atualizarListasEDados();
          },
        },
      ],
    });

    await alert.present();
  }

  adicionarCategoriaPersonalizada() {
    const nome = this.novaCategoriaPersonalizada.trim();
    if (!nome) return;

    if (
      !this.categoriasPadrao.includes(nome) &&
      !this.categoriasPersonalizadas.includes(nome)
    ) {
      this.categoriasPersonalizadas.push(nome);
    }

    this.novaCategoriaPersonalizada = '';
    this.novaCategoria = nome; // já seleciona pro próximo item
  }

  async renomearLista() {
    const alert = await this.alertController.create({
      header: 'Nome da lista',
      inputs: [
        {
          name: 'nome',
          type: 'text',
          value: this.nomeLista,
          placeholder: 'Ex: Lista do mês, Churrasco...',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Salvar',
          handler: async (data) => {
            const nome = (data.nome ?? '').trim();
            const novoNome = nome || 'Lista de Compras';

            await this.shoppingService.setNomeLista(novoNome);
            this.atualizarListasEDados();
          },
        },
      ],
    });

    await alert.present();
  }

  // ---------------------------
  // AÇÕES RÁPIDAS
  // ---------------------------
  async marcarTodosComoComprados() {
    const pendentes = this.lista.filter((i) => !i.comprado);

    for (const item of pendentes) {
      await this.shoppingService.alternarComprado(item.id);
    }

    this.atualizarListasEDados();
  }

  async limparApenasComprados() {
    const comprados = this.lista.filter((i) => i.comprado);
    if (!comprados.length) {
      return;
    }

    const alert = await this.alertController.create({
      header: 'Remover itens comprados?',
      message: `Isso vai remover ${comprados.length} item(ns) já marcados como comprados.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Remover',
          role: 'destructive',
          handler: async () => {
            for (const item of comprados) {
              await this.shoppingService.remover(item.id);
            }
            this.atualizarListasEDados();
          },
        },
      ],
    });

    await alert.present();
  }

  async editar(item: ShoppingItem) {
    const alert = await this.alertController.create({
      header: 'Editar item',
      inputs: [
        {
          name: 'nome',
          type: 'text',
          value: item.nome,
          placeholder: 'Nome do produto',
        },
        {
          name: 'quantidade',
          type: 'number',
          value: String(item.quantidade),
          min: 1,
        },
        {
          name: 'categoria',
          type: 'text',
          value: item.categoria || 'Geral',
          placeholder: 'Categoria',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Salvar',
          handler: (data) => {
            const nome = (data.nome ?? '').trim();
            const qtd = parseInt(data.quantidade, 10) || 1;
            const cat = (data.categoria ?? '').trim() || 'Geral';

            if (!nome) {
              return false;
            }

            this.shoppingService
              .atualizar(item.id, {
                nome,
                quantidade: qtd,
                categoria: cat,
              })
              .then(() => {
                this.atualizarListasEDados();
              });

            return true;
          },
        },
      ],
    });

    await alert.present();
  }

  // ---------------------------
  // COMPARTILHAR WHATSAPP
  // ---------------------------
  compartilharWhatsApp() {
    const itensBase = this.listaFiltrada.length ? this.listaFiltrada : this.lista;

    if (!itensBase.length) {
      return;
    }

    const mapa = new Map<string, ShoppingItem[]>();

    for (const item of itensBase) {
      const cat = item.categoria || 'Geral';
      if (!mapa.has(cat)) {
        mapa.set(cat, []);
      }
      mapa.get(cat)!.push(item);
    }

    const linhas: string[] = [];
    linhas.push('🛒 Minha lista de compras:\n');

    const categoriasOrdenadas = Array.from(mapa.keys()).sort((a, b) =>
      a.localeCompare(b, 'pt-BR')
    );

    for (const categoria of categoriasOrdenadas) {
      linhas.push(`📂 ${categoria}:`);
      const itens = mapa.get(categoria)!;

      itens.sort((a, b) =>
        a.nome.toLowerCase().localeCompare(b.nome.toLowerCase(), 'pt-BR')
      );

      for (const i of itens) {
        const check = i.comprado ? '✅' : '⬜';
        linhas.push(`  ${check} ${i.nome} (Qtd: ${i.quantidade})`);
      }

      linhas.push('');
    }

    const texto = linhas.join('\n');
    const url = 'https://wa.me/?text=' + encodeURIComponent(texto);

    window.open(url, '_blank');
  }
}
