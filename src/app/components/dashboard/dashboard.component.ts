import { Component, HostListener, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MeasurementService } from '../../services/measurement.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  measurementService = inject(MeasurementService);
  router = inject(Router);

  welcomeUsername: string | null = null;
  isMenuOpen = false;

  selectedType = 'LengthUnit';
  selectedAction = 'add';
  isArithmeticMode = true;

  result: any = null;
  error: string | null = null;

  units: any = {
    LengthUnit: ['FEET', 'INCHES', 'YARDS', 'CENTIMETERS', 'METERS'],
    WeightUnit: ['KILOGRAM', 'GRAM', 'POUND', 'MILLIGRAM'],
    VolumeUnit: ['MILLILITRE', 'LITRE', 'GALLON'],
    TemperatureUnit: ['CELSIUS', 'FAHRENHEIT', 'KELVIN'],
  };

  calc = {
    val1: 1,
    val2: 1,
    unit1: '',
    unit2: '',
    targetUnit: '',
    operator: 'add',
  };

  get isTemperatureSelected(): boolean {
    return this.selectedType === 'TemperatureUnit';
  }

  ngOnInit() {
    this.updateUnits();
    this.welcomeUsername = this.getFirstName(this.authService.getUsernameFromToken());
  }

  private getFirstName(fullName: string | null): string | null {
    if (!fullName) return null;

    const cleanedName = fullName.trim();
    if (!cleanedName) return null;

    return cleanedName.split(' ')[0];
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth > 768) {
      this.closeMenu();
    }
  }

  goToHistory() {
    this.router.navigate(['/history']);
  }

  logout(): void {
    this.authService.logout();
  }

  updateUnits() {
    this.calc.unit1 = this.units[this.selectedType][0];
    this.calc.unit2 = this.units[this.selectedType][0];
    this.calc.targetUnit = this.units[this.selectedType][0];
  }

  setType(type: string) {
    this.selectedType = type;
    this.updateUnits();

    if (this.selectedType === 'TemperatureUnit') {
      this.selectedAction = 'convert';
      this.isArithmeticMode = false;
      this.calc.operator = 'add';
      this.calc.val2 = 0;
    }

    this.result = null;
    this.error = null;
  }

  setAction(action: string) {
    if (this.selectedType === 'TemperatureUnit' && action !== 'convert') {
      this.error = 'For Temperature, only conversion is available right now.';
      return;
    }

    this.selectedAction = action;
    this.isArithmeticMode = action === 'add' || action === 'subtract' || action === 'divide';

    if (action === 'convert') {
      this.calc.val2 = 0;
    }

    if (this.isArithmeticMode) {
      this.calc.operator = action;
    }

    this.result = null;
    this.error = null;
  }

  calculate() {
    this.error = null;
    this.result = null;

    if (this.selectedType === 'TemperatureUnit' && this.selectedAction !== 'convert') {
      this.error = 'For Temperature, only conversion is available right now.';
      return;
    }

    const baseBody: any = {
      thisQuantityDTO: {
        value: this.calc.val1,
        unit: this.calc.unit1,
        measurementType: this.selectedType,
      },
      thatQuantityDTO: {
        value: this.selectedAction === 'convert' ? 0 : this.calc.val2,
        unit: this.calc.unit2,
        measurementType: this.selectedType,
      },
    };

    if (this.selectedAction === 'add-with-target-unit') {
      baseBody.targetQuantityDTO = {
        value: 0,
        unit: this.calc.targetUnit,
        measurementType: this.selectedType,
      };
    }

    let request$;

    if (this.isArithmeticMode) {
      switch (this.calc.operator) {
        case 'add':
          request$ = this.measurementService.add(baseBody);
          break;
        case 'subtract':
          request$ = this.measurementService.subtract(baseBody);
          break;
        case 'divide':
          request$ = this.measurementService.divide(baseBody);
          break;
        default:
          this.error = 'Invalid arithmetic operation selected';
          return;
      }
    } else {
      switch (this.selectedAction) {
        case 'compare':
          request$ = this.measurementService.compare(baseBody);
          break;
        case 'convert':
          request$ = this.measurementService.convert(baseBody);
          break;
        case 'add-with-target-unit':
          request$ = this.measurementService.addWithTargetUnit(baseBody);
          break;
        default:
          this.error = 'Invalid operation selected';
          return;
      }
    }

    request$.subscribe({
      next: (res) => {
        this.result = res;
      },
      error: (err) => {
        this.error = 'Measurement failed: ' + (err.error?.message || 'Server Error');
      },
    });
  }
}
