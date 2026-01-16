// angular import
import { Component, OnInit, viewChild, inject } from '@angular/core';

// project import

// third party
import { NgApexchartsModule, ChartComponent, ApexOptions } from 'ng-apexcharts';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { AdminApiService } from 'src/app/services/admin-api.service';

@Component({
  selector: 'app-income-overview-chart',
  imports: [CardComponent, NgApexchartsModule],
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
          // Format date string "YYYY-MM-DD" to short day e.g. "Mon"
          const date = new Date(d.date);
          return date.toLocaleDateString('th-TH', { weekday: 'short' });
        });
        const counts = data.map((d) => d.count);

        this.chartOptions = {
          chart: {
            type: 'bar',
            height: 365,
            toolbar: { show: false },
            background: 'transparent'
          },
          plotOptions: {
            bar: {
              columnWidth: '45%',
              borderRadius: 4,
              distributed: true // Optional: different colors for bars
            }
          },
          dataLabels: { enabled: false },
          series: [
            {
              name: 'จำนวนออเดอร์',
              data: counts
            }
          ],
          stroke: { curve: 'smooth', width: 2 },
          xaxis: {
            categories: days,
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: {
              style: {
                colors: days.map(() => '#8c8c8c')
              }
            }
          },
          yaxis: { show: false },
          colors: ['#5cdbd3', '#ff9c6e', '#ffc069', '#95de64', '#597ef7', '#85a5ff', '#b37feb'],
          grid: { show: false },
          tooltip: { theme: 'light' }
        };
      },
      error: (err) => console.error('Error loading weekly orders:', err)
    });
  }
}
