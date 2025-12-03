import { Injectable } from '@angular/core';
import { EventItem } from '../../models/event.model';

@Injectable({ providedIn: 'root' })
export class EventService {

  // Chave usada no localStorage
  private storageKey = 'events';

  // Lista em memória
  private events: EventItem[] = [];

  constructor() {
    // Carrega dados do armazenamento assim que o serviço sobe
    this.loadEvents();
  }

  // Busca do localStorage e converte pra lista
  private loadEvents() {
    const data = localStorage.getItem(this.storageKey);
    this.events = data ? JSON.parse(data) : [];
  }

  // Salva a lista atual no localStorage
  private saveEvents() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.events));
  }

  // Retorna cópia dos eventos (não solta o array original)
  getEvents(): EventItem[] {
    return [...this.events];
  }

  // Eventos por dia específico (início ou fim bate)
  getEventsByDate(date: string): EventItem[] {
    return this.events.filter(ev =>
      ev.startDate === date || ev.endDate === date
    );
  }

  // Busca simples: título, local ou datas
  search(query: string): EventItem[] {
    const q = query.toLowerCase();
    return this.events.filter(ev =>
      ev.title.toLowerCase().includes(q) ||
      (ev.location || '').toLowerCase().includes(q) ||
      (ev.startDate || '').toLowerCase().includes(q) ||
      (ev.endDate || '').toLowerCase().includes(q)
    );
  }

  // Aceita um único item ou uma lista inteira
  addEvent(eventOrEvents: EventItem | EventItem[]) {
    if (Array.isArray(eventOrEvents)) {
      this.events.push(...eventOrEvents);
    } else {
      this.events.push(eventOrEvents);
    }
    this.saveEvents();
  }
}