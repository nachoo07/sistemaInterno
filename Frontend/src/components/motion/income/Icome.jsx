import React, { useState, useContext } from 'react';
import '../income/income.css';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import 'dayjs/locale/es';
import { MotionContext } from '../../../context/motion/MotionContext';
import { Table, Button } from 'react-bootstrap';
import { FaTrash, FaEdit } from 'react-icons/fa';
dayjs.locale('es');
dayjs.extend(utc);

const Income = () => {
  const { motions, createMotion, updateMotion, deleteMotion } = useContext(MotionContext);

  const [formData, setFormData] = useState({
    concept: '',
    amount: '',
    paymentMethod: '',
    selectedDate: '',
    incomeType: ''
  });

  const [filters, setFilters] = useState({
    startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
    incomeType: ''
  });

  const [editIndex, setEditIndex] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const motionData = { ...formData };

    if (editIndex !== null) {
      updateMotion(motions[editIndex]._id, motionData);
      setEditIndex(null);
    } else {
      createMotion(motionData);
    }

    setFormData({
      concept: '',
      amount: '',
      paymentMethod: '',
      selectedDate: '',
      incomeType: ''
    });
  };

  const handleEdit = (index) => {
    const item = motions[index];
    setFormData({
      concept: item.concept,
      selectedDate: dayjs.utc(item.date).format('YYYY-MM-DD'),
      amount: item.amount,
      paymentMethod: item.paymentMethod,
      incomeType: item.incomeType
    });
    setEditIndex(index);
  };

  const handleDelete = (index) => deleteMotion(motions[index]._id);

  const handleCancel = () => {
    setFormData({
      concept: '',
      amount: '',
      paymentMethod: '',
      selectedDate: '',
      incomeType: ''
    });
    setEditIndex(null);
  };

  const filteredData = motions.filter(item => {
    if (!item?.date) return false;
    const itemDate = dayjs(item.date);
    return (
      itemDate.isAfter(dayjs(filters.startDate)) &&
      itemDate.isBefore(dayjs(filters.endDate)) &&
      (!filters.incomeType || item.incomeType === filters.incomeType)
    );
  });

  return (
    <div className="income-dashboard">
      <div className="income-content">
        <h1 className="income-title">Movimientos</h1>

        <div className="motion-form">
          <form onSubmit={handleSubmit}>
            <div className="motion-form-row">
              <input
                type="text"
                name="concept"
                placeholder="Concepto"
                value={formData.concept}
                onChange={handleInputChange}
                required
              />
              <input
                type="date"
                name="selectedDate"
                max={dayjs().format('YYYY-MM-DD')}
                value={formData.selectedDate}
                onChange={handleInputChange}
                required
              />
              <input
                type="number"
                name="amount"
                placeholder="Monto"
                value={formData.amount}
                onChange={handleInputChange}
                required
              />
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                required
              >
                <option value="">Método de Pago</option>
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
              </select>
              <select
                name="incomeType"
                value={formData.incomeType}
                onChange={handleInputChange}
                required
              >
                <option value="">Tipo</option>
                <option value="ingreso">Ingreso</option>
                <option value="egreso">Egreso</option>
              </select>
            </div>
            <div className="motion-form-actions">
              <Button type="submit" className="motion-save-btn">
                {editIndex !== null ? 'Actualizar' : 'Guardar'}
              </Button>
              {editIndex !== null && (
                <Button className="motion-cancel-btn" onClick={handleCancel}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </div>

        <div className="motion-date-filter">
          <div className="motion-filter-item">
            <label>Desde:</label>
            <input
              type="date"
              value={filters.startDate}
              max={dayjs().format('YYYY-MM-DD')}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
            />
          </div>
          <div className="motion-filter-item">
            <label>Hasta:</label>
            <input
              type="date"
              value={filters.endDate}
              max={dayjs().format('YYYY-MM-DD')}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
            />
          </div>
          <div className="motion-filter-item">
            <label>Tipo:</label>
            <select
              value={filters.incomeType}
              onChange={(e) => setFilters(prev => ({ ...prev, incomeType: e.target.value }))}
            >
              <option value="">Todos</option>
              <option value="ingreso">Ingreso</option>
              <option value="egreso">Egreso</option>
            </select>
          </div>
        </div>

        <Table className="motion-table">
          <thead>
            <tr>
              <th>Concepto</th>
              <th>Fecha</th>
              <th>Monto</th>
              <th className='metodo-pago-motion'>Método</th>
              <th>Tipo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr key={item._id || index} className='motion-row'>
                <td>{item.concept}</td>
                <td>{dayjs.utc(item.date).format('DD-MM-YYYY')}</td>
                <td>{`$ ${item.amount.toLocaleString('es')}`}</td>
                <td className='metodo-pago-motion'>{item.paymentMethod}</td>
                <td>{item.incomeType}</td>
                <td className="motion-actions">
                  <Button className="motion-edit-btn" onClick={() => handleEdit(index)}>
                    <span className="text-btn">Editar</span>
                    <span className="icon-btn"><FaEdit /></span>
                  </Button>
                  <Button className="motion-delete-btn" onClick={() => handleDelete(index)}>
                    <span className="text-btn">Eliminar</span>
                    <span className="icon-btn"><FaTrash /></span>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default Income;