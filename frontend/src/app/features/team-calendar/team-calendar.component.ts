import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LeaveService } from '../../core/services/leave.service';
import { AuthService } from '../../core/services/auth.service';
import { CalendarEntry } from '../../core/models/models';

interface DayCell {
  date: Date | null;
  isToday: boolean;
  entries: CalendarEntry[];
}

@Component({
  selector: 'app-team-calendar',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './team-calendar.component.html',
  styleUrl: './team-calendar.component.css'
})
export class TeamCalendarComponent implements OnInit {

  loading = signal(true);
  allEntries = signal<CalendarEntry[]>([]);
  viewDate = signal(new Date());

  weekDayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  monthLabel = computed(() => this.viewDate().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));

  calendarCells = computed<DayCell[]>(() => {
    const view = this.viewDate();
    const year = view.getFullYear();
    const month = view.getMonth();

    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = firstDay.getDay(); // 0 = Sunday

    const cells: DayCell[] = [];
    for (let i = 0; i < startOffset; i++) {
      cells.push({ date: null, isToday: false, entries: [] });
    }

    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === today.toDateString();
      const entries = this.allEntries().filter(e => {
        const start = new Date(e.startDate);
        const end = new Date(e.endDate);
        return date >= this.stripTime(start) && date <= this.stripTime(end);
      });
      cells.push({ date, isToday, entries });
    }

    return cells;
  });

  constructor(private leaveService: LeaveService, public auth: AuthService) {}

  ngOnInit(): void {
    this.leaveService.getTeamCalendar().subscribe({
      next: res => { this.allEntries.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  previousMonth(): void {
    const d = this.viewDate();
    this.viewDate.set(new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  nextMonth(): void {
    const d = this.viewDate();
    this.viewDate.set(new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  today(): void {
    this.viewDate.set(new Date());
  }

  private stripTime(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
}
