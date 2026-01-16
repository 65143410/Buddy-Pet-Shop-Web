// angular import
import { Component, viewChild, inject } from '@angular/core';
import { AdminApiService } from 'src/app/services/admin-api.service';

// project import

// third party
import { NgApexchartsModule, ChartComponent, ApexOptions } from 'ng-apexcharts';

@Component({
  selector: 'app-sales-report-chart',
  imports: [NgApexchartsModule],
  templateUrl: './sales-report-chart.component.html',
  styleUrl: './sales-report-chart.component.scss'
})
export class SalesReportChartComponent {
  chart = viewChild.required<ChartComponent>('chart');
  chartOptions!: Partial<ApexOptions>;

  private adminService = inject(AdminApiService);

  constructor() {
    this.adminService.getTopSellers().subscribe({
      next: (data) => {
        const names = data.map((d) => d.productName);
        const amounts = data.map((d) => d.totalSold);

        this.chartOptions = {
          chart: {
            type: 'bar',
            height: 430,
            toolbar: { show: false },
            background: 'transparent'
          },
          plotOptions: {
            bar: {
              columnWidth: '30%',
              borderRadius: 4
            }
          },
          stroke: { show: true, width: 8, colors: ['transparent'] },
          dataLabels: { enabled: false },
          legend: {
            position: 'top',
            horizontalAlign: 'right',
            show: true,
            fontFamily: `'Public Sans', sans-serif`,
            offsetX: 10,
            offsetY: 10,
            labels: { useSeriesColors: false },
            itemMargin: { horizontal: 15, vertical: 5 }
          },
          series: [
            {
              name: 'จำนวนที่ขายได้ (ชิ้น)',
              data: amounts
            }
          ],
          xaxis: {
            categories: names,
            labels: {
              style: {
                colors: names.map(() => '#222')
              }
            }
          },
          tooltip: { theme: 'light' },
          colors: ['#faad14', '#1677ff'],
          grid: { borderColor: '#f5f5f5' }
        };
      },
      error: (err) => console.error('Error loading top sellers:', err)
    });
  }
}
