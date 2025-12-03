import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCalendar } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, CommonModule } from '@angular/common';

import { CreateEvent } from '../create-event/create-event';
import { EventService } from '../event-service/event-service';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatNativeDateModule,
    RouterModule,
    MatCalendar
  ],
  templateUrl: './agenda.html',
  styleUrl: './agenda.scss',
  providers: [DatePipe]
})
export class Agenda {

  selectedDate = new Date();
  eventsToday: any[] = [];
  showGrid = false;

  constructor(
    private dialog: MatDialog,
    private eventService: EventService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.updateList();
  }

  // Quando o usuário seleciona um dia no calendário
  onDaySelected(date: Date) {
    this.selectedDate = date;
    this.updateList();
  }

  // Atualiza lista com base no selectedDate
  updateList() {
    const dateStr = this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd')!;
    this.eventsToday = this.eventService.getEventsByDate(dateStr);
  }

  // Barra de pesquisa
  search(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value?.trim();

    if (!value) {
      this.updateList();
      return;
    }

    this.eventsToday = this.eventService.search(value);
  }

  toggleGrid() {
    this.showGrid = !this.showGrid;
  }

  openCreate() {
    const ref = this.dialog.open(CreateEvent, {
      maxWidth: '480px',
      width: '90vw',
      maxHeight: '90vh',
      panelClass: 'create-event-dialog'
    });

    ref.afterClosed().subscribe(saved => {
      if (saved) this.updateList();
    });
  }

  openThemeMenu() {
    import('../theme-config/theme-config').then(module => {
      const ThemeConfig = module.ThemeConfig;

      this.dialog.open(ThemeConfig, {
        width: '340px',
        panelClass: 'create-event-dialog'
      });
    });
  }

  isToday(date: Date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }
}
