import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartDataPoint {
  label: string;
  value: number;
}

// 1. Line Chart: Confidence Trend
export const TimelineChart: React.FC<{ data: { date: string; confidence: number }[] }> = ({ data }) => {
  const chartData = {
    labels: data.map(d => d.date),
    datasets: [
      {
        label: 'Average Scan Confidence (%)',
        data: data.map(d => d.confidence),
        borderColor: '#0e8ce2',
        backgroundColor: 'rgba(14, 140, 226, 0.08)',
        fill: true,
        tension: 0.3,
        pointBackgroundColor: '#03589c',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `Confidence: ${context.parsed.y}%`
        }
      }
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        grid: {
          color: '#f1f5f9'
        },
        ticks: {
          font: { size: 10 }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: { size: 10 }
        }
      }
    }
  };

  return (
    <div className="h-64">
      {data.length === 0 ? (
        <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">No history data available</div>
      ) : (
        <Line data={chartData} options={options} />
      )}
    </div>
  );
};

// 2. Bar Chart: Monthly scans volume
export const MonthlyScansChart: React.FC<{ data: { month: string; scans: number }[] }> = ({ data }) => {
  const chartData = {
    labels: data.map(d => d.month),
    datasets: [
      {
        label: 'Scans Conducted',
        data: data.map(d => d.scans),
        backgroundColor: '#bae0fd',
        hoverBackgroundColor: '#0e8ce2',
        borderRadius: 6,
        borderSkipped: false,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: { size: 10 }
        },
        grid: {
          color: '#f1f5f9'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: { size: 10 }
        }
      }
    }
  };

  return (
    <div className="h-64">
      {data.length === 0 ? (
        <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">No monthly data available</div>
      ) : (
        <Bar data={chartData} options={options} />
      )}
    </div>
  );
};

// 3. Doughnut Chart: Disease and condition frequency
export const DiseaseDistributionChart: React.FC<{ data: { disease: string; count: number }[] }> = ({ data }) => {
  const filteredData = data.filter(d => d.count > 0);
  
  const chartData = {
    labels: filteredData.map(d => d.disease),
    datasets: [
      {
        data: filteredData.map(d => d.count),
        backgroundColor: [
          '#10b981', // Healthy: Emerald Green
          '#f59e0b', // Dandruff: Amber
          '#ef4444', // Psoriasis: Red
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 12,
          padding: 15,
          font: { size: 11, weight: '500' as any }
        }
      }
    },
    cutout: '65%'
  };

  return (
    <div className="h-64 flex items-center justify-center">
      {filteredData.length === 0 ? (
        <div className="text-slate-400 text-sm font-medium">No diagnostic history found</div>
      ) : (
        <Doughnut data={chartData} options={options} />
      )}
    </div>
  );
};
