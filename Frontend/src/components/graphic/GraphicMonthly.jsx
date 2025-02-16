import React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';

const GraphicMonthly = ({ data }) => {
  const {
    totalCuotas,
    totalIngresos,
    totalEgresos,
    balanceFinal,
    efectivoDisponible,
    transferenciaDisponible,
  } = data;

  return (
    <>
      <BarChart
        series={[
          { data: [totalCuotas, totalIngresos, totalEgresos, balanceFinal, efectivoDisponible, transferenciaDisponible] }
        ]}
        height={190}
        width={500}
        xAxis={[{ data: ['Cuotas', 'Ingresos', 'Egresos', 'Balance', 'Efectivo', 'Transferencia'], scaleType: 'band' }]}
        margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
      />
    </>
  );
};

export default GraphicMonthly;