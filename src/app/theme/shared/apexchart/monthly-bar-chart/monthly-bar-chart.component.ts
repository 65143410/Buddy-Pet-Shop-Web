// angular import
import { Component, OnInit, viewChild, inject } from '@angular/core';
import { AdminApiService } from 'src/app/services/admin-api.service';

// project import

// third party
import { NgApexchartsModule, ChartComponent, ApexOptions } from 'ng-apexcharts';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-monthly-bar-chart',
  imports: [NgApexchartsModule, CommonModule],
  templateUrl: './monthly-bar-chart.component.html',
  styleUrl: './monthly-bar-chart.component.scss'
})
export class MonthlyBarChartComponent implements OnInit {
  // public props
  chart = viewChild.required<ChartComponent>('chart');
  chartOptions!: Partial<ApexOptions>;

  // life cycle hook
  private adminService = inject(AdminApiService);

  // life cycle hook
  ngOnInit() {
    this.loadChartData();
  }

  loadChartData() {
    this.adminService.getMonthlySales().subscribe({
      next: (data) => {
        const months = data.map((d) => d.month);
        const sales = data.map((d) => d.totalSales);

        this.chartOptions = {
          chart: {
            height: 450,
            type: 'bar', // Changed to Bar for better sales visualization
            toolbar: { show: false },
            background: 'transparent'
          },
          dataLabels: { enabled: false },
          colors: ['#1677ff'],
          series: [
            {
              name: 'ยอดขายรวม (บาท)',
              data: sales
            }
          ],
          stroke: {
            curve: 'smooth',
            width: 2
          },
          xaxis: {
            categories: months,
            labels: {
              style: { colors: '#8c8c8c' }
            },
            axisBorder: { show: true, color: '#f0f0f0' }
          },
          yaxis: {
            labels: {
              style: { colors: ['#8c8c8c'] },
              formatter: (val) => val.toLocaleString() // Format numbers
            }
          },
          grid: {
            strokeDashArray: 0,
            borderColor: '#f5f5f5'
          },
          theme: { mode: 'light' },
          plotOptions: {
            bar: {
              columnWidth: '50%',
              borderRadius: 4
            }
          }
        };
      },
      error: (err) => console.error('Error fetching chart data:', err)
    });
  }

  // public method
  toggleActive(value: string) {
    // Placeholder: In future can toggle between Month/Week if backend supports it
    // Currently logic is simplified to just keep 'month' active visually
    if (value === 'month') {
      document.querySelector('.chart-income.month')?.classList.add('active');
      document.querySelector('.chart-income.week')?.classList.remove('active');
    } else {
      document.querySelector('.chart-income.week')?.classList.add('active');
      document.querySelector('.chart-income.month')?.classList.remove('active');
    }
  }
}
