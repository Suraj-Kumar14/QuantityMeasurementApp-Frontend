import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MeasurementService } from '../../services/measurement.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  private measurementService = inject(MeasurementService);
  private router = inject(Router);

  authService = inject(AuthService);

  historyList: any[] = [];
  error: string = '';
  loading = true;

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.measurementService.getAllHistory().subscribe({
      next: (res) => {
        this.historyList = res;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load history.';
        this.loading = false;
      }
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  formatOperation(operation: string): string {
    if (!operation) return '';
    return operation.charAt(0).toUpperCase() + operation.slice(1).toLowerCase();
  }
}