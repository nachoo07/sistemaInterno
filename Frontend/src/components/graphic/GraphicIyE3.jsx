import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import '../graphic/graphic.css';

const COLORS = ['#0088FE', '#00C49F'];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent === 0) return null; // No mostrar etiqueta si el porcentaje es 0

  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{`${payload[0].name}`}</p>
      </div>
    );
  }
  return null;
};

const GraphicIyE3 = ({ efectivo = 0, transferencia = 0 }) => {
  const total = efectivo + transferencia;

  // Si no hay datos, mostrar un mensaje con color gris
  if (total === 0) {
    return (
      <div className="no-data">
        <PieChart width={400} height={400}>
          <Pie
            data={[{ name: 'Sin datos', value: 1 }]}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#d3d3d3"
            dataKey="value"
          />
        </PieChart>
      </div>
    );
  }

  const data = [
    { name: 'Efectivo', value: efectivo },
    { name: 'Transferencia', value: transferencia },
  ];

  return (
    <div className="graphic-container">
      <ResponsiveContainer width={400} height={400}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraphicIyE3;