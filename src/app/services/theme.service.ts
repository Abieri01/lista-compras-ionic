import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private STORAGE_KEY = 'lista_compras_tema_escuro';

  // Carrega o tema salvo e aplica no body
  carregarTema(): boolean {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    const enabled = raw === 'true';

    document.body.classList.toggle('dark', enabled);
    return enabled;
  }

  // Define o modo escuro/claro e salva
  setDark(enabled: boolean) {
    document.body.classList.toggle('dark', enabled);
    localStorage.setItem(this.STORAGE_KEY, String(enabled));
  }
}
