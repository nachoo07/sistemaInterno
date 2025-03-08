import React, { useEffect, useRef } from 'react';
import ApexCharts from 'apexcharts';
import '../graphic/graphic.css';

const GraphicIyE3 = ({ efectivo = 0, transferencia = 0 }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const efectivoNum = Number(efectivo) || 0;
    const transferenciaNum = Number(transferencia) || 0;
    const total = efectivoNum + transferenciaNum;

    if (!chartRef.current) {
      return;
    }

    const options = {
      series: total === 0 ? [1] : [efectivoNum, transferenciaNum], 
      chart: {
        width: total === 0 ? 380 : 430, 
        height: total === 0 ? 380 : 430, 
        type: 'donut',
        events: {
          mouseMove: total === 0 ? () => false : undefined,
          click: total === 0 ? () => false : undefined
        }
      },
      dataLabels: {
        enabled: false 
      },
      responsive: [{
        breakpoint: 576,
        options: {
          chart: {
            width: total === 0 ? 200 : 200,
            height: total === 0 ? 200 : 200
          },
          legend: {
            show: false 
          }
        }
      }],
      legend: {
        position: 'right',
        offsetY: 0,
        height: 230,
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
        },
        show: true, 
        formatter: function (seriesName, opts) {
          // Mostrar mensaje personalizado en la leyenda cuando no hay datos
          if (total === 0) {
            return 'No hay datos';
          }
          return `${seriesName}: $${opts.w.globals.series[opts.seriesIndex].toLocaleString('es-ES')}`;
        }
      },
      colors: total === 0 ? ['#00E396'] : ['#0088FE', '#00C49F'], 
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
      tooltip: {
        enabled: true,
        custom: function ({ series, seriesIndex, dataPointIndex, w }) {
          if (total === 0) {
            return `<div class="custom-tooltip">
              <p class="label">No hay datos disponibles</p>
            </div>`;
          }
          return `<div class="custom-tooltip">
            <p class="label">${w.config.labels[seriesIndex]}: $${series[seriesIndex].toLocaleString('es-ES')}</p>
          </div>`;
        }
      },
      labels: total === 0 ? ['Sin datos'] : ['Efectivo', 'Transferencia'],
      plotOptions: {
        pie: {
          donut: {
            size: '65%', 
          }
        }
      },
      states: {
       
        hover: {
          filter: total === 0 ? { type: 'none' } : undefined
        },
        active: {
          filter: total === 0 ? { type: 'none' } : undefined
        }
      }
    };

    const chart = new ApexCharts(chartRef.current, options);
    chart.render();

    return () => {
      if (chart) chart.destroy();
    };
  }, [efectivo, transferencia]); 

  return (
    <div className="graphic-container">
      <div className="chart-wrapper" ref={chartRef}>
        <div id="chart" />
      </div>
    </div>
  );
};

export default GraphicIyE3;