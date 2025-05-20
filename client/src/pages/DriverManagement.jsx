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
<<<<<<< HEAD
  if (random < 0.7) return 'RUNNING';
=======
  if (random < 0.8) return 'RUNNING';
>>>>>>> 9f73a69ce2de0abcbb2b7337b0d45578d9acb51d
  if (random < 0.9) return 'READY';
  return 'LATE';
};

<<<<<<< HEAD
const generateRandomBusNumber = () => {
  // Generate bus numbers in the format BUS-123
  return `BUS-${Math.floor(Math.random() * 900) + 100}`;
};

=======
const generateRandomBlock = () => (Math.random() < 0.2 ? 'YES' : 'NO');
>>>>>>> 9f73a69ce2de0abcbb2b7337b0d45578d9acb51d
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
<<<<<<< HEAD
      <td className="border p-3 text-white">{row.busNumber}</td>
=======
      <td className="border p-3 text-white">{row.block}</td>
>>>>>>> 9f73a69ce2de0abcbb2b7337b0d45578d9acb51d
    </tr>
  );
};

const DriverManagement = () => {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const generateInitialRows = () => {
      const drivers = generateUniqueDrivers(10);
<<<<<<< HEAD
      const generatedRows = [];
      
      // First, create rows with drivers
      for (let i = 0; i < drivers.length; i++) {
        const driver = drivers[i];
        const status = generateRandomStatus();
        
        generatedRows.push({
          driver: driver,
          status: status,
          busNumber: generateRandomBusNumber(),
          iconColor: generateRandomColor(),
        });
      }
      
      // Count how many READY drivers we have
      const readyDriversCount = generatedRows.filter(row => row.status === 'READY').length;
      
      // Calculate how many missing drivers we can have (equal to or less than ready drivers)
      const maxMissingDrivers = Math.min(readyDriversCount, Math.floor(drivers.length * 0.3));
      
      // Convert some of the RUNNING drivers to MISSING DRIVER
      // but make sure we don't convert READY drivers
      let missingCount = 0;
      for (let i = 0; i < generatedRows.length && missingCount < maxMissingDrivers; i++) {
        if (generatedRows[i].status !== 'READY') {
          generatedRows[i] = {
            driver: 'MISSING DRIVER',
            status: '',
            busNumber: generateRandomBusNumber(),
            iconColor: '',
          };
          missingCount++;
        }
      }
      
      return generatedRows;
    };
    
=======
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
>>>>>>> 9f73a69ce2de0abcbb2b7337b0d45578d9acb51d
    setRows(generateInitialRows());
  }, []);

  const handleDropDriver = (dragIndex, dropIndex) => {
    setRows((prevRows) => {
<<<<<<< HEAD
      // Check if the dragged driver has a READY status
      if (prevRows[dragIndex].status !== 'READY') {
        return prevRows; // Don't allow non-READY drivers to be assigned
      }
      
      // Check if the target is a MISSING DRIVER slot
      if (prevRows[dropIndex].driver !== 'MISSING DRIVER') {
        return prevRows; // Only allow dropping onto MISSING DRIVER slots
      }
      
      const newRows = [...prevRows];
      // Keep the bus number from the target row but update the driver
      const busNumber = newRows[dropIndex].busNumber;
      newRows[dropIndex] = { 
        ...newRows[dragIndex], 
        status: 'RUNNING',
        busNumber: busNumber
      };
      newRows[dragIndex] = { driver: 'ASSIGNED', status: '', busNumber: '', iconColor: '' };
=======
      const newRows = [...prevRows];
      newRows[dropIndex] = { ...newRows[dragIndex], status: 'RUNNING' };
      newRows[dragIndex] = { driver: 'ASSIGNED', status: '', block: '', iconColor: '' };
>>>>>>> 9f73a69ce2de0abcbb2b7337b0d45578d9acb51d
      return newRows;
    });
  };

<<<<<<< HEAD
  // Calculate statistics for the UI
  const missingDriversCount = rows.filter(row => row.driver === 'MISSING DRIVER').length;
  const readyDriversCount = rows.filter(row => row.status === 'READY').length;

=======
>>>>>>> 9f73a69ce2de0abcbb2b7337b0d45578d9acb51d
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-8 bg-teal-700 min-h-screen">
        <div className="mb-8 text-2xl font-bold text-black">Driver Management System</div>
<<<<<<< HEAD
        
        <div className="mb-6 flex space-x-6">
          <div className="bg-gray-800 p-3 rounded-lg shadow-lg text-white">
            <span className="font-bold">Missing Drivers:</span> {missingDriversCount}
          </div>
          <div className="bg-gray-800 p-3 rounded-lg shadow-lg text-white">
            <span className="font-bold">Ready Drivers:</span> {readyDriversCount}
          </div>
        </div>
        
=======
>>>>>>> 9f73a69ce2de0abcbb2b7337b0d45578d9acb51d
        <table className="min-w-full border border-black rounded-lg shadow-lg overflow-hidden">
          <thead>
            <tr className="bg-black">
              <th className="border p-3 text-left text-white">DRIVER</th>
              <th className="border p-3 text-left text-white">STATUS</th>
<<<<<<< HEAD
              <th className="border p-3 text-left text-white">BUS NUMBER</th>
=======
              <th className="border p-3 text-left text-white">BLOCK</th>
>>>>>>> 9f73a69ce2de0abcbb2b7337b0d45578d9acb51d
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <DriverRow key={index} row={row} index={index} onDropDriver={handleDropDriver} />
            ))}
          </tbody>
        </table>
        <div className="mt-8 text-sm text-white bg-gray-800 p-4 rounded-lg shadow-sm">
<<<<<<< HEAD
          <div className="font-bold mb-2">Instructions:</div>
          <ul className="list-disc ml-5">
=======
          Instruction:
          <ul className="list-disc ml-5 mt-2">
>>>>>>> 9f73a69ce2de0abcbb2b7337b0d45578d9acb51d
            <li>Drag a 'READY' driver and drop onto a 'MISSING DRIVER' slot to assign</li>
          </ul>
        </div>
      </div>
    </DndProvider>
  );
};

export default DriverManagement;