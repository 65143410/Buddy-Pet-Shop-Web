// angular import
import { Component, viewChild, inject } from '@angular/core';
import { AdminApiService } from 'src/app/services/admin-api.service';

// project import

// third party
import { NgApexchartsModule, ChartComponent, ApexOptions } from 'ng-apexcharts';

@Component({
  selector: 'app-analytics-chart',
  imports: [NgApexchartsModule],
  templateUrl: './analytics-chart.component.html',
  styleUrl: './analytics-chart.component.scss'
})
export class AnalyticsChartComponent {
  // public props
  chart = viewChild.required<ChartComponent>('chart');
  chartOptions!: Partial<ApexOptions>;

  //  constructor
  private adminService = inject(AdminApiService);

  constructor() {
    this.adminService.getDailyRevenue().subscribe({
      next: (data) => {
        const dates = data.map((d) => d.date);
        const revenues = data.map((d) => d.revenue);

        this.chartOptions = {
          chart: {
            type: 'area', // Changed to area for better visualization
            height: 340,
            toolbar: { show: false },
            background: 'transparent'
          },
          stroke: { curve: 'smooth', width: 2 }, // Thicker line
          colors: ['#FFB814'],
          grid: {
            strokeDashArray: 4,
            borderColor: '#f5f5f5'
          },
          series: [
            {
              name: 'รายได้ (บาท)',
              data: revenues
            }
          ],
          xaxis: {
            type: 'datetime',
            categories: dates,
            labels: {
              format: 'dd MMM', // Show Day + Month e.g., 18 Jan
              style: {
                colors: '#8c8c8c'
              }
            },
            axisBorder: { show: false },
            axisTicks: { show: false }
          },
          yaxis: { show: false },
          tooltip: { theme: 'light' },
          fill: {
            type: 'gradient',
            gradient: {
              shadeIntensity: 1,
              opacityFrom: 0.7,
              opacityTo: 0.9,
              stops: [0, 90, 100]
            }
          }
        };
      },
      error: (err) => console.error('Error loading revenue trend:', err)
    });
  }
}
