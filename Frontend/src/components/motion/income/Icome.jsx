import React, { useState, useContext } from 'react';
import '../income/income.css';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import 'dayjs/locale/es';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { MotionContext } from '../../../context/motion/MotionContext';

dayjs.locale('es');
dayjs.extend(utc);

const Icome = () => {
  const { motions, createMotion, updateMotion, deleteMotion } = useContext(MotionContext);
  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [selectedDate, setSelectedDate] = useState(''); // Ahora empieza vacío
  const [startDate, setStartDate] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [incomeType, setIncomeType] = useState('');
  const [editIndex, setEditIndex] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newData = { 
      concept, 
      date: selectedDate, // Se guarda sin modificaciones
      amount, 
      paymentMethod, 
      incomeType 
    };
    if (editIndex !== null) {
      updateMotion(motions[editIndex]._id, newData);
      setEditIndex(null);
    } else {
      createMotion(newData);
    }
    setConcept('');
    setSelectedDate('');
    setAmount('');
    setPaymentMethod('');
    setIncomeType('');
  };

  const handleEdit = (index) => {
    const item = motions[index];
    setConcept(item.concept);
    setSelectedDate(dayjs.utc(item.date).format('YYYY-MM-DD'));
    setAmount(item.amount);
    setPaymentMethod(item.paymentMethod);
    setIncomeType(item.incomeType);
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    deleteMotion(motions[index]._id);
  };

  const filteredData = motions.filter(item => {
    if (!item || !item.date) return false;
    const itemDate = dayjs(item.date);
    return itemDate.isAfter(dayjs(startDate)) && itemDate.isBefore(dayjs(endDate));
  });

  return (
    <>
      <div className='main-container'>
        <div className='content-container'>
          <h1 className='titulo-registrar-dinero'>Registrar Dinero</h1>
          <form onSubmit={handleSubmit}>
            <div>
              <label>Concepto:</label>
              <input 
                type="text" 
                value={concept} 
                onChange={(e) => setConcept(e.target.value)} 
                required 
              />
            </div>
            <div>
              <label>Fecha:</label>
              <input
                type="date"
                value={selectedDate}
                max={dayjs().format('YYYY-MM-DD')}
                onChange={(e) => setSelectedDate(dayjs(e.target.value).format('YYYY-MM-DD'))}
                required
              />
            </div>
            <div>
              <label>Monto:</label>
              <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                required 
              />
            </div>
            <div>
              <label>Método de Pago:</label>
              <select 
                value={paymentMethod} 
                onChange={(e) => setPaymentMethod(e.target.value)} 
                required
              >
                <option value="">Seleccionar</option>
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
              </select>
            </div>
            <div>
              <label>Tipo de Ingreso:</label>
              <select 
                value={incomeType} 
                onChange={(e) => setIncomeType(e.target.value)} 
                required
              >
                <option value="">Seleccionar</option>
                <option value="ingreso">Ingreso</option>
                <option value="egreso">Egreso</option>
              </select>
            </div>
            <button className='boton-guardar' type="submit">
              {editIndex !== null ? 'Actualizar' : 'Guardar'}
            </button> </form>

          <div className='date-range-picker'>
            <div>
            <label>Desde:</label>
            <input
              type="date"
              value={startDate}
              max={dayjs().format('YYYY-MM-DD')}
              onChange={(e) => setStartDate(e.target.value)}
            />
            </div>
          <div>
          <label>Hasta:</label>
            <input
              type="date"
              value={endDate}
              max={dayjs().format('YYYY-MM-DD')}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
     
          </div>

          <table>
            <thead>
              <tr>
                <th>Concepto</th>
                <th>Fecha</th>
                <th>Monto</th>
                <th>Método de Pago</th>
                <th>Tipo de Ingreso</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr key={index}>
                  <td>{item.concept}</td>
                  <td>{dayjs.utc(item.date).format('DD-MM-YYYY')}</td>
                  <td>{`$ ${item.amount.toLocaleString('es')}`}</td>
                  <td>{item.paymentMethod}</td>
                  <td>{item.incomeType}</td>
                  <td>
                    <button className='boton-registro' onClick={() => handleEdit(index)}>Editar</button>
                    <button className='boton-registro' onClick={() => handleDelete(index)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Icome;