import { Component, EventEmitter, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'theme-config',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './theme-config.html',
  styleUrl: './theme-config.scss'
})
export class ThemeConfig {

  @Output() themeChange = new EventEmitter<string>();

  // Tema atual selecionado (carregado do localStorage ou padrão "roxo")
  selected: 'roxo' | 'verde' | 'laranja' =
    (localStorage.getItem('theme') as any) || 'roxo';

  // Paleta base de cada tema
  themes: any = {
    roxo: {
      '--color-primary-1': '#6B449B',
      '--color-primary-2': '#B281EE',
      '--color-primary-3': '#E3D2F7',
      '--color-primary-4': '#F0E3FF',
      '--color-primary-5': '#F2EAFB',

      '--color-bg-1': '#fefaffff',
      '--color-bg-2': '#F3EDF7',
      '--color-text': 'black'
    },
    verde: {
      '--color-primary-1': '#15C515',
      '--color-primary-2': '#95D795',
      '--color-primary-3': '#d4f7d2',
      '--color-primary-4': '#e5ffe3',
      '--color-primary-5': '#ecfbea',

      '--color-bg-1': '#fbfffbff',
      '--color-bg-2': '#edf7edff',
      '--color-text': 'black'
    },
    laranja: {
      '--color-primary-1': '#F2932E',
      '--color-primary-2': '#F5B672',
      '--color-primary-3': '#f7e6d2',
      '--color-primary-4': '#fff0e3',
      '--color-primary-5': '#fbf1ea',

      '--color-bg-1': '#fffcfaff',
      '--color-bg-2': '#f7f2edff',
      '--color-text': 'black'
    }
  };

  // Atualiza o tema selecionado, aplica variáveis e emite evento
  select(color: 'roxo' | 'verde' | 'laranja') {
    this.selected = color;
    localStorage.setItem('theme', color);

    const vars = this.themes[color];
    const root = document.documentElement;

    // Aplica todas as variáveis definidas na paleta principal
    Object.keys(vars).forEach(key => {
      root.style.setProperty(key, vars[key]);
    });

    // Aplica as derivações automáticas (agenda, botões, ícones etc.)
    this.applyDerivedThemeVars(color);

    // Notifica componentes ouvindo a mudança
    this.themeChange.emit(color);
  }

  // Gera e aplica variáveis derivadas com base no tema selecionado
  private applyDerivedThemeVars(theme: 'roxo' | 'verde' | 'laranja') {
    const root = document.documentElement;

    // Mapeia o prefixo de cada tema para suas variantes
    const map = {
      roxo: [
        '--color-purple-1',
        '--color-purple-2',
        '--color-purple-3',
        '--color-purple-4',
        '--color-purple-5'
      ],
      laranja: [
        '--color-orange-1',
        '--color-orange-2',
        '--color-orange-3',
        '--color-orange-4',
        '--color-orange-5'
      ],
      verde: [
        '--color-green-1',
        '--color-green-2',
        '--color-green-3',
        '--color-green-4',
        '--color-green-5'
      ]
    }[theme];

    // Primeira e última cor são usadas em elementos específicos
    const first = map[0];
    const last = map[4];

    // Derivações aplicadas globalmente para a UI
    root.style.setProperty('--agenda-bg', `var(${last})`);
    root.style.setProperty('--event-dot', `var(${first})`);
    root.style.setProperty('--theme-icon-color', `var(${first})`);
    root.style.setProperty('--new-event-btn-bg', `var(${first})`);
  }

  // Aplica o tema inicial na carga do componente
  ngOnInit() {
    this.select(this.selected);
  }
}