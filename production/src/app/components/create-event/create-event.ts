import { Component, ViewChild, TemplateRef, ViewEncapsulation, Optional } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

import { EventService } from '../event-service/event-service';
import { EventItem } from '../../models/event.model';
import { v4 as uuid } from 'uuid';

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatSlideToggleModule,
    MatDatepickerModule,
    MatDialogModule
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './create-event.html',
  styleUrl: './create-event.scss',
})
export class CreateEvent {
  // Template do popup de ícones
  @ViewChild('iconPickerTemplate') iconPickerTemplate!: TemplateRef<any>;

  // Referência da janela de ícones
  private iconPickerRef?: MatDialogRef<any>;

  constructor(
    private eventService: EventService,
    private dialog: MatDialog,
    @Optional() private dialogRef?: MatDialogRef<CreateEvent>
  ) {}

  // Controle se o evento não possui horário definido
  noTime = false;

  // Estrutura principal do formulário
  form = {
    title: '',
    icon: 'event',
    startDate: null as Date | null,
    endDate: null as Date | null,
    startTime: '',
    endTime: '',
    location: '',
    repeat: 'none',
  };

  // Ícones disponíveis
  iconOptions = [
    'event', 'cake', 'work',
    'school', 'schedule', 'favorite',
    'restaurant', 'sports_soccer', 'group'
  ];

  // Abre o seletor de ícones
  openIconPicker() {
    this.iconPickerRef = this.dialog.open(this.iconPickerTemplate, {
      width: '320px',
      maxHeight: '80vh',
      panelClass: 'theme-dialog-panel',
    });
  }

  // Seleciona ícone e fecha popup
  selectIcon(icon: string) {
    this.form.icon = icon;
    this.iconPickerRef?.close();
  }

  // Formata data para YYYY-MM-DD
  private formatDateYYYYMMDD(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  // Converte string YYYY-MM-DD para Date
  private parseDateYYYYMMDD(s: string): Date | null {
    if (!s) return null;
    const parts = s.split('-');
    if (parts.length !== 3) return null;
    const [y, m, d] = parts.map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  }

  // Junta a data selecionada com o horário informado
  combineDateAndTime(date: any, time: string): Date | null {
    if (!date) return null;

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (!time) return dateObj;

    const [h, m] = time.split(':').map(Number);
    const finalDate = new Date(dateObj);
    finalDate.setHours(h || 0, m || 0, 0, 0);

    return finalDate;
  }

  /*
    Geração de ocorrências repetidas
    Baseado em:
      - Data inicial e final
      - Regra de repetição
      - Data limite
      - Dias excluídos (para repetição diária)
  */
  private generateOccurrences(
    baseStart: Date,
    baseEnd: Date,
    startTime: string | null,
    endTime: string | null,
    repeat: string,
    repeatEndDate: Date,
    excludeWeekdays: number[] = []
  ): EventItem[] {
    const occurrences: EventItem[] = [];
    const seriesId = uuid();

    // Cria uma ocorrência
    const pushOccurrence = (dStart: Date, dEnd: Date) => {
      const item: EventItem = {
        id: uuid(),
        title: this.form.title,
        location: this.form.location,
        startDate: this.formatDateYYYYMMDD(dStart),
        endDate: this.formatDateYYYYMMDD(dEnd),
        icon: this.form.icon,
        startTime: this.noTime ? null : (startTime || ''),
        endTime: this.noTime ? null : (endTime || ''),
        repeat: repeat === 'none' ? 'none' : repeat,
        seriesId
      };
      occurrences.push(item);
    };

    // Se não repetir, só cria 1 e devolve
    if (repeat === 'none') {
      pushOccurrence(baseStart, baseEnd);
      return occurrences;
    }

    // Itera dia a dia até a data final
    let curStart = new Date(baseStart.getTime());
    let curEnd = new Date(baseEnd.getTime());

    while (curStart <= repeatEndDate) {
      if (repeat === 'daily') {
        if (!excludeWeekdays.includes(curStart.getDay())) {
          pushOccurrence(new Date(curStart), new Date(curEnd));
        }
        curStart.setDate(curStart.getDate() + 1);
        curEnd.setDate(curEnd.getDate() + 1);
        continue;
      }

      if (repeat === 'weekly') {
        if (curStart.getDay() === baseStart.getDay()) {
          pushOccurrence(new Date(curStart), new Date(curEnd));
        }
        curStart.setDate(curStart.getDate() + 1);
        curEnd.setDate(curEnd.getDate() + 1);
        continue;
      }

      if (repeat === 'monthly') {
        if (curStart.getDate() === baseStart.getDate()) {
          pushOccurrence(new Date(curStart), new Date(curEnd));
        }
        curStart.setDate(curStart.getDate() + 1);
        curEnd.setDate(curEnd.getDate() + 1);
        continue;
      }

      if (repeat === 'yearly') {
        if (
          curStart.getDate() === baseStart.getDate() &&
          curStart.getMonth() === baseStart.getMonth()
        ) {
          pushOccurrence(new Date(curStart), new Date(curEnd));
        }
        curStart.setDate(curStart.getDate() + 1);
        curEnd.setDate(curEnd.getDate() + 1);
        continue;
      }

      pushOccurrence(new Date(curStart), new Date(curEnd));
      curStart.setDate(curStart.getDate() + 1);
      curEnd.setDate(curEnd.getDate() + 1);
    }

    return occurrences;
  }

  // Salva o evento
  async save() {
    // Prepara datas conforme tenha horário ou não
    const start = this.noTime
      ? (this.form.startDate ? new Date(this.form.startDate) : null)
      : this.combineDateAndTime(this.form.startDate, this.form.startTime);

    const end = this.noTime
      ? (this.form.endDate ? new Date(this.form.endDate) : null)
      : this.combineDateAndTime(this.form.endDate, this.form.endTime);

    if (!this.form.title.trim()) {
      alert('Título é obrigatório.');
      return;
    }

    if (!start || !end) {
      alert('Datas inválidas.');
      return;
    }

    // Sem repetição: salva evento único
    if (this.form.repeat === 'none') {
      const single: EventItem = {
        id: uuid(),
        title: this.form.title,
        location: this.form.location,
        startDate: this.formatDateYYYYMMDD(start),
        endDate: this.formatDateYYYYMMDD(end),
        icon: this.form.icon,
        startTime: this.noTime ? null : this.form.startTime || '',
        endTime: this.noTime ? null : this.form.endTime || '',
        repeat: 'none',
        seriesId: null
      };

      this.eventService.addEvent(single);
      this.dialogRef?.close(true);
      return;
    }

    // Pergunta data final da série
    let repeatUntilStr = window.prompt(
      'Repetir até que data? (YYYY-MM-DD)',
      this.formatDateYYYYMMDD(end)
    );

    if (!repeatUntilStr) return;

    const repeatEndDate = this.parseDateYYYYMMDD(repeatUntilStr);

    if (!repeatEndDate) {
      alert('Data inválida. Use YYYY-MM-DD.');
      return;
    }

    // Valida ordem
    const startDayOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    if (repeatEndDate < startDayOnly) {
      alert('A data final deve ser igual ou posterior à inicial.');
      return;
    }

    // Exclusão de dias na repetição diária (via prompt)
    let excludeWeekdays: number[] = [];
    if (this.form.repeat === 'daily') {
      const ex = window.prompt(
        'Excluir dias? Separe por vírgula (Sun,Mon) ou números 0-6. Deixe vazio para nenhum.',
        ''
      );

      if (ex && ex.trim()) {
        const tokens = ex.split(',').map(t => t.trim());
        const map: any = { sun:0, mon:1, tue:2, wed:3, thu:4, fri:5, sat:6 };

        tokens.forEach(t => {
          const key = t.toLowerCase();
          const num = Number(t);

          if (map[key] !== undefined) excludeWeekdays.push(map[key]);
          else if (!isNaN(num) && num >= 0 && num <= 6) excludeWeekdays.push(num);
        });
      }
    }

    // Gera lista final de eventos repetidos
    const occurrences = this.generateOccurrences(
      start,
      end,
      this.noTime ? null : this.form.startTime,
      this.noTime ? null : this.form.endTime,
      this.form.repeat,
      repeatEndDate,
      excludeWeekdays
    );

    if (!occurrences.length) {
      alert('Nenhuma ocorrência gerada.');
      return;
    }

    this.eventService.addEvent(occurrences);
    this.dialogRef?.close(true);
  }
}