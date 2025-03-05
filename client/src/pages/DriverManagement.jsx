import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const ItemType = { DRIVER: 'driver' };

const generateUniqueDrivers = (count) => {
  const names = ['John Smith', 'Alice Johnson', 'Bob Wilson', 'Emma Davis', 'Mike Brown', 'Sarah Miller', 'Chris Evans', 'Laura Taylor', 'James White', 'Olivia Clark'];
  const shuffledNames = names.sort(() => Math.random() - 0.5);
  return shuffledNames.slice(0, count);
};

const generateRandomStatus = () => {
  const random = Math.random();
  if (random < 0.8) return 'RUNNING';
  if (random < 0.9) return 'READY';
  return 'LATE';
};

const generateRandomBlock = () => (Math.random() < 0.2 ? 'YES' : 'NO');
const generateRandomColor = () => {
  const colors = ['bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-orange-500'];
  return colors[Math.floor(Math.random() * colors.length)];
};

const getStatusColor = (status) => {
  switch (status) {
    case 'RUNNING':
      return 'text-green-500';
    case 'READY':
      return 'text-blue-500';
    case 'LATE':
      return 'text-red-500';
    default:
      return 'text-white';
  }
};

const DriverRow = ({ row, index, onDropDriver }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemType.DRIVER,
    item: { index },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemType.DRIVER,
    drop: (item) => onDropDriver(item.index, index),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <tr
      ref={row.driver === 'MISSING DRIVER' ? drop : drag}
      className={`${isDragging ? 'opacity-50' : ''} ${isOver ? 'bg-blue-200' : 'bg-gray-800 hover:bg-gray-800'}`}
    >
      <td className={`border p-3 ${row.driver === 'MISSING DRIVER' ? 'text-red-600 font-bold' : 'text-white'}`}>
        <div className="flex items-center space-x-3">
          {row.driver !== 'MISSING DRIVER' && row.driver !== 'ASSIGNED' && (
            <div className={`w-8 h-8 rounded-full ${row.iconColor} flex items-center justify-center text-white font-bold`}>
              {row.driver.charAt(0)}
            </div>
          )}
          <span>{row.driver}</span>
        </div>
      </td>
      <td className={`border p-3 ${getStatusColor(row.status)}`}>{row.status}</td>
      <td className="border p-3 text-white">{row.block}</td>
    </tr>
  );
};

const DriverManagement = () => {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const generateInitialRows = () => {
      const drivers = generateUniqueDrivers(10);
      return drivers.map((driver) => {
        if (Math.random() < 0.3) {
          return { driver: 'MISSING DRIVER', status: '', block: '', iconColor: '' };
        } else {
          return {
            driver,
            status: generateRandomStatus(),
            block: generateRandomBlock(),
            iconColor: generateRandomColor(),
          };
        }
      });
    };
    setRows(generateInitialRows());
  }, []);

  const handleDropDriver = (dragIndex, dropIndex) => {
    setRows((prevRows) => {
      const newRows = [...prevRows];
      newRows[dropIndex] = { ...newRows[dragIndex], status: 'RUNNING' };
      newRows[dragIndex] = { driver: 'ASSIGNED', status: '', block: '', iconColor: '' };
      return newRows;
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-8 bg-teal-700 min-h-screen">
        <div className="mb-8 text-2xl font-bold text-black">Driver Management System</div>
        <table className="min-w-full border border-black rounded-lg shadow-lg overflow-hidden">
          <thead>
            <tr className="bg-black">
              <th className="border p-3 text-left text-white">DRIVER</th>
              <th className="border p-3 text-left text-white">STATUS</th>
              <th className="border p-3 text-left text-white">BLOCK</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <DriverRow key={index} row={row} index={index} onDropDriver={handleDropDriver} />
            ))}
          </tbody>
        </table>
        <div className="mt-8 text-sm text-white bg-gray-800 p-4 rounded-lg shadow-sm">
          Instruction:
          <ul className="list-disc ml-5 mt-2">
            <li>Drag a 'READY' driver and drop onto a 'MISSING DRIVER' slot to assign</li>
          </ul>
        </div>
      </div>
    </DndProvider>
  );
};

export default DriverManagement;