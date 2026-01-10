/**
 * Charts Component - Chart.js Wrapper
 * Provides easy-to-use chart creation methods
 */

const Charts = {
  // Default color palette
  colors: {
    primary: '#2563eb',
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
    purple: '#8b5cf6',
    pink: '#ec4899',
    gray: '#6b7280'
  },

  // Default chart options
  defaultOptions: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: { size: 12, family: 'Inter, system-ui, sans-serif' }
        }
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleFont: { size: 13 },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 8
      }
    }
  },

  /**
   * Create a Line Chart
   */
  line(canvasId, data, options = {}) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    return new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels || [],
        datasets: data.datasets.map((ds, i) => ({
          label: ds.label || `Dataset ${i + 1}`,
          data: ds.data || [],
          borderColor: ds.color || Object.values(this.colors)[i],
          backgroundColor: ds.fill ? this.hexToRgba(ds.color || Object.values(this.colors)[i], 0.1) : 'transparent',
          borderWidth: 2,
          tension: 0.4,
          fill: ds.fill || false,
          pointRadius: 4,
          pointHoverRadius: 6,
          ...ds
        }))
      },
      options: {
        ...this.defaultOptions,
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#e5e7eb' },
            ticks: { font: { size: 11 } }
          },
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 } }
          }
        },
        ...options
      }
    });
  },

  /**
   * Create a Bar Chart
   */
  bar(canvasId, data, options = {}) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels || [],
        datasets: data.datasets.map((ds, i) => ({
          label: ds.label || `Dataset ${i + 1}`,
          data: ds.data || [],
          backgroundColor: ds.colors || Object.values(this.colors)[i],
          borderRadius: 6,
          borderSkipped: false,
          ...ds
        }))
      },
      options: {
        ...this.defaultOptions,
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#e5e7eb' },
            ticks: { font: { size: 11 } }
          },
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 } }
          }
        },
        ...options
      }
    });
  },

  /**
   * Create a Doughnut/Pie Chart
   */
  doughnut(canvasId, data, options = {}) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    return new Chart(ctx, {
      type: options.pie ? 'pie' : 'doughnut',
      data: {
        labels: data.labels || [],
        datasets: [{
          data: data.values || [],
          backgroundColor: data.colors || Object.values(this.colors),
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        ...this.defaultOptions,
        cutout: options.pie ? 0 : '70%',
        ...options
      }
    });
  },

  /**
   * Create an Area Chart
   */
  area(canvasId, data, options = {}) {
    return this.line(canvasId, {
      ...data,
      datasets: data.datasets.map(ds => ({ ...ds, fill: true }))
    }, options);
  },

  /**
   * Create a Horizontal Bar Chart
   */
  horizontalBar(canvasId, data, options = {}) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels || [],
        datasets: data.datasets.map((ds, i) => ({
          label: ds.label || `Dataset ${i + 1}`,
          data: ds.data || [],
          backgroundColor: ds.colors || Object.values(this.colors)[i],
          borderRadius: 6,
          ...ds
        }))
      },
      options: {
        ...this.defaultOptions,
        indexAxis: 'y',
        scales: {
          x: {
            beginAtZero: true,
            grid: { color: '#e5e7eb' }
          },
          y: {
            grid: { display: false }
          }
        },
        ...options
      }
    });
  },

  /**
   * Create a Mixed Chart (Line + Bar)
   */
  mixed(canvasId, data, options = {}) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels || [],
        datasets: data.datasets.map((ds, i) => ({
          type: ds.type || 'bar',
          label: ds.label || `Dataset ${i + 1}`,
          data: ds.data || [],
          backgroundColor: ds.type === 'line' ? 'transparent' : (ds.color || Object.values(this.colors)[i]),
          borderColor: ds.color || Object.values(this.colors)[i],
          borderWidth: ds.type === 'line' ? 2 : 0,
          borderRadius: ds.type === 'line' ? 0 : 6,
          tension: 0.4,
          ...ds
        }))
      },
      options: {
        ...this.defaultOptions,
        scales: {
          y: { beginAtZero: true, grid: { color: '#e5e7eb' } },
          x: { grid: { display: false } }
        },
        ...options
      }
    });
  },

  /**
   * Helper: Convert hex to rgba
   */
  hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  },

  /**
   * Destroy a chart instance
   */
  destroy(chart) {
    if (chart) chart.destroy();
  },

  /**
   * Update chart data
   */
  update(chart, newData) {
    if (!chart) return;
    chart.data.labels = newData.labels || chart.data.labels;
    newData.datasets?.forEach((ds, i) => {
      if (chart.data.datasets[i]) {
        chart.data.datasets[i].data = ds.data || chart.data.datasets[i].data;
      }
    });
    chart.update();
  }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Charts;
}
