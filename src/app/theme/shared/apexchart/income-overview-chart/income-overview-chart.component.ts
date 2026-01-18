// angular import
import { Component, OnInit, viewChild, inject } from '@angular/core';

// project import

// third party
import { NgApexchartsModule, ChartComponent, ApexOptions } from 'ng-apexcharts';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { AdminApiService } from 'src/app/services/admin-api.service';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-income-overview-chart',
  imports: [CardComponent, NgApexchartsModule, CommonModule],
  templateUrl: './income-overview-chart.component.html',
  styleUrl: './income-overview-chart.component.scss'
})
export class IncomeOverviewChartComponent implements OnInit {
  // public props
  chart = viewChild.required<ChartComponent>('chart');
  chartOptions!: Partial<ApexOptions>;

  // life cycle hook
  private adminService = inject(AdminApiService);

  ngOnInit() {
    this.adminService.getWeeklyOrders().subscribe({
      next: (data) => {
        const days = data.map((d) => {
          const date = new Date(d.date);
          return date.toLocaleDateString('th-TH', { weekday: 'short' });
        });
        const counts = data.map((d) => d.count);
        const revenues = data.map((d) => d.revenue || 0);

        this.chartOptions = {
          chart: {
            type: 'line', // Mixed chart
            height: 365,
            toolbar: { show: false },
            background: 'transparent'
          },
          plotOptions: {
            bar: {
              columnWidth: '45%',
              borderRadius: 4
            }
          },
          dataLabels: { enabled: false },
          series: [
            {
              name: 'จำนวนออเดอร์',
              type: 'column',
              data: counts
            },
            {
              name: 'รายได้รวม (บาท)',
              type: 'line',
              data: revenues
            }
          ],
          stroke: {
            width: [0, 4], // Column: 0, Line: 4
            curve: 'smooth'
          },
          xaxis: {
            categories: days,
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: {
              style: {
                colors: '#8c8c8c'
              }
            }
          },
          yaxis: [
            {
              show: false, // Left axis (Count)
              min: 0
            },
            {
              opposite: true, // Right axis (Revenue)
              show: false,
              min: 0
            }
          ],
          colors: ['#5cdbd3', '#ff4d4f'], // Column Color, Line Color
          grid: { show: false },
          tooltip: {
            theme: 'light',
            shared: true,
            intersect: false,
            y: {
              formatter: function (y) {
                if (typeof y !== 'undefined') {
                  return y.toFixed(0);
                }
                return y;
              }
            }
          },
          legend: {
            show: true,
            position: 'top'
          }
        };
      },
      error: (err) => console.error('Error loading weekly orders:', err)
    });
  }
}
