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
    // Ionic
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
    // Angular
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
    // pequeno delay só pra garantir que o storage inicializou
    setTimeout(() => {
      this.lista = this.shoppingService.getItens();
    }, 300);
  }

  async adicionar() {
    const nome = this.novoItemNome.trim();
    const qtd = this.novoItemQuantidade ?? 1;
    const cat = this.novaCategoria || 'Geral';

    if (!nome) return;

    await this.shoppingService.adicionar(nome, qtd, cat);
    this.lista = this.shoppingService.getItens();

    this.novoItemNome = '';
    this.novoItemQuantidade = 1;
    this.novaCategoria = 'Geral';
  }

  async remover(item: ShoppingItem) {
    await this.shoppingService.remover(item.id);
    this.lista = this.shoppingService.getItens();
  }

  async alternarComprado(item: ShoppingItem) {
    await this.shoppingService.alternarComprado(item.id);
    this.lista = this.shoppingService.getItens();
  }

  async limparTudo() {
    await this.shoppingService.limpar();
    this.lista = this.shoppingService.getItens();
  }
}
