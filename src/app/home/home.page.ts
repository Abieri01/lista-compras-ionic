import { Component, OnInit } from '@angular/core';
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

  // lista
  lista: ShoppingItem[] = [];

  constructor(private shoppingService: ShoppingListService) {}

  ngOnInit() {
    setTimeout(() => {
      this.lista = this.shoppingService.getItens();
      this.ordenarLista();
    }, 300);
  }

  // todas as categorias disponíveis (padrão + personalizadas)
  get categorias(): string[] {
    const set = new Set<string>([
      ...this.categoriasPadrao,
      ...this.categoriasPersonalizadas,
    ]);
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }

  // lista filtrada (categoria + apenas não comprados)
  get listaFiltrada(): ShoppingItem[] {
    let itens = [...this.lista];

    if (this.categoriaFiltro !== 'Todas') {
      itens = itens.filter(
        (i) => (i.categoria || 'Geral') === this.categoriaFiltro
      );
    }

    if (this.mostrarSomenteNaoComprados) {
      itens = itens.filter((i) => !i.comprado);
    }

    return itens;
  }

  // grupos por categoria para exibir visualmente
  get gruposPorCategoria(): { categoria: string; itens: ShoppingItem[] }[] {
    const mapa = new Map<string, ShoppingItem[]>();

    for (const item of this.listaFiltrada) {
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

    // itens dentro de cada categoria já vêm ordenados, mas garantimos:
    for (const g of grupos) {
      g.itens.sort((a, b) =>
        a.nome.toLowerCase().localeCompare(b.nome.toLowerCase(), 'pt-BR')
      );
    }

    return grupos;
  }

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

  async adicionar() {
    const nome = this.novoItemNome.trim();
    const qtd = this.novoItemQuantidade ?? 1;
    const cat = this.novaCategoria || 'Geral';

    if (!nome) return;

    await this.shoppingService.adicionar(nome, qtd, cat);
    this.lista = this.shoppingService.getItens();
    this.ordenarLista();

    this.novoItemNome = '';
    this.novoItemQuantidade = 1;
    this.novaCategoria = 'Geral';
  }

  async remover(item: ShoppingItem) {
    await this.shoppingService.remover(item.id);
    this.lista = this.shoppingService.getItens();
    this.ordenarLista();
  }

  async alternarComprado(item: ShoppingItem) {
    await this.shoppingService.alternarComprado(item.id);
    this.lista = this.shoppingService.getItens();
    this.ordenarLista();
  }

  async limparTudo() {
    await this.shoppingService.limpar();
    this.lista = this.shoppingService.getItens();
    this.ordenarLista();
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
}
