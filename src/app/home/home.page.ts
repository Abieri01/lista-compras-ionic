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
    CommonModule,
    FormsModule,
    NgIf,
    NgForOf,
    NgClass,
  ],
})
export class HomePage implements OnInit {
  novoItemNome = '';
  novoItemQuantidade: number | null = 1;
  novaCategoria = 'Geral';
  lista: ShoppingItem[] = [];

  constructor(private shoppingService: ShoppingListService) {}

  ngOnInit() {
    setTimeout(() => {
      this.lista = this.shoppingService.getItens();
      this.ordenarLista();
    }, 300);
  }

  private ordenarLista() {
    this.lista.sort((a, b) => {
      const catA = a.categoria?.toLowerCase() || 'geral';
      const catB = b.categoria?.toLowerCase() || 'geral';

      if (catA < catB) return -1;
      if (catA > catB) return 1;

      // Dentro da mesma categoria, ordena por nome
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
}
