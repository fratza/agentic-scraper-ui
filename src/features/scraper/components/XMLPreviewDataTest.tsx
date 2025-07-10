import React, { useState } from 'react';
import XMLPreviewData from './XMLPreviewData';
import { XMLRowData } from '../../../model';

// Mock data for testing the layout
const mockXmlData: XMLRowData[] = [
  {
    id: '1',
    title: 'Product 1',
    date: '2025-07-10',
    image: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg',
    description: 'This is a description for product 1. It contains details about the product that might span multiple lines of text.'
  },
  {
    id: '2',
    title: 'Product 2',
    date: '2025-07-09',
    image: 'https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg',
    description: 'Product 2 description with some details about features and specifications.'
  },
  {
    id: '3',
    title: 'Product 3',
    date: '2025-07-08',
    image: 'https://example.com/invalid-image.jpg',
    description: 'This product has an invalid image URL to demonstrate fallback behavior.'
  }
];

const XMLPreviewDataTest: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [xmlData, setXmlData] = useState<XMLRowData[]>(mockXmlData);

  const handleAddRow = () => {
    const newRow: XMLRowData = {
      id: Date.now().toString(),
      title: '',
      date: '',
      image: '',
      description: ''
    };
    setXmlData([...xmlData, newRow]);
  };

  return (
    <div style={{ padding: '20px' }}>
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          padding: '10px 20px',
          backgroundColor: 'var(--primary-color, #3498db)',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        Open XML Preview
      </button>
      
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer'
                }}
              >
                &times;
              </button>
            </div>
            <XMLPreviewData
              isOpen={isOpen}
              onClose={() => setIsOpen(false)}
              xmlData={xmlData}
              onAddRow={handleAddRow}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default XMLPreviewDataTest;
