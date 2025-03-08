import React, { useEffect, useRef } from 'react';
import ApexCharts from 'apexcharts';
import '../graphic/graphic.css';

const GraphicIyE2 = ({ ingreso = 0, egreso = 0 }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const ingresoNum = Number(ingreso) || 0;
    const egresoNum = Number(egreso) || 0;
    const total = ingresoNum + egresoNum;
    if (!chartRef.current) {
      return;
    }

    const options = {
      series: total === 0 ? [0.01] : [ingresoNum, egresoNum],
      chart: {
        type: 'pie',
        width: total === 0 ? 200 : 330,
        height: total === 0 ? 200 : 300,
        events: {
          dataPointSelection: (event, chartContext, config) => {
          }
        }
      },
      labels: total === 0 ? ['Sin datos'] : ['Ingreso', 'Egreso'],
      colors: total === 0 ? ['#008FFB'] : ['#0088FE', '#00C49F'],
      annotations: {
        position: 'front',
        yaxis: total === 0 ? [{
          y: 0,
          borderColor: 'transparent',
          label: {
            text: 'No hay datos disponibles',
            style: {
              color: '#d3d3d3',
              fontSize: '20px',
              fontWeight: 'bold',
            }
          }
        }] : []
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
            height: 200
          },
          legend: {
            position: 'right'
          }
        }
      }],
      dataLabels: {
        enabled: true,
        formatter: (val, opts) => {
          const seriesValue = opts.w.config.series[opts.seriesIndex];
          if (total === 0) return 'Sin datos';
          const percent = (seriesValue / total) * 100;
          if (isNaN(percent) || percent === 0) {
            return '0%';
          }
          return `${percent.toFixed(0)}%`;
        },
        style: {
          fontSize: '16px',
          fontFamily: 'Arial, sans-serif',
          fontWeight: 'bold',
          colors: ['#fff']
        },
        dropShadow: {
          enabled: false
        },
        position: 'center',
        offsetX: 0,
        offsetY: 0,
        minAngleToShowLabel: 5
      },
      legend: {
        show: total !== 0,
        position: 'right',
        horizontalAlign: 'center',
        verticalAlign: 'middle',
        fontSize: '18px',
        markers: {
          width: 12,
          height: 12,
          radius: 2
        },
        itemMargin: {
          horizontal: 10,
          vertical: 5
        }
      },
      tooltip: {
        enabled: true,
        custom: function ({ series, seriesIndex, dataPointIndex, w }) {
          if (total === 0) {
            return `<div class="custom-tooltip">
              <p class="label">Sin datos: $0</p>
            </div>`;
          }
          return `<div class="custom-tooltip">
            <p class="label">${w.config.labels[seriesIndex]}: $${series[seriesIndex].toLocaleString('es-ES')}</p>
          </div>`;
        }
      },
      plotOptions: {
        pie: {
          expandOnClick: false,
          dataLabels: {
            enabled: true,
            offset: 0,
            minAngleToShowLabel: 5,
            style: {
              fontSize: '26px',
              fontWeight: 'bold',
              colors: ['#fff']
            }
          }
        }
      }
    };

    const chart = new ApexCharts(chartRef.current, options);
    chart.render();

    return () => {
      if (chart) chart.destroy();
    };
  }, [ingreso, egreso]);

  return (
    <div className="graphic-container">
      <div className="chart-wrapper" ref={chartRef}>
        <div id="chart" />
      </div>
    </div>
  );
};

export default GraphicIyE2;