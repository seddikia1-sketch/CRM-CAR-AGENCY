import React from 'react';
import { MessageCircle, Clock, DollarSign } from 'lucide-react';
import type { Client } from '../../types';
import { formatCurrency, getWhatsAppLink, formatRelativeTime } from '../../utils/formatters';
import { SOURCE_MAP } from '../../utils/constants';
import './PipelineCard.css';

interface PipelineCardProps {
  client: Client;
  onClick: () => void;
  onDragStart: (e: React.DragEvent, clientId: string) => void;
}

export const PipelineCard: React.FC<PipelineCardProps> = ({ client, onClick, onDragStart }) => {
  const source = SOURCE_MAP[client.source];

  const carInfo = [client.brand, client.model, client.year].filter(Boolean).join(' ') || client.vehicleInterest || '';

  return (
    <div 
      className="pipeline-card" 
      onClick={onClick}
      draggable
      onDragStart={(e) => onDragStart(e, client.id)}
    >
      <div className="card-header">
        <h4 className="card-title">{client.name}</h4>
        <span className="card-source" title={source?.label}>{source?.emoji}</span>
      </div>
      
      {carInfo && (
        <p className="card-vehicle">{carInfo}</p>
      )}
      
      <div className="card-details">
        {client.estimatedValue > 0 && (
          <div className="detail-item text-accent">
            <DollarSign size={14} />
            <span>{formatCurrency(client.estimatedValue)}</span>
          </div>
        )}
        <div className="detail-item">
          <Clock size={14} />
          <span>{formatRelativeTime(client.lastContactAt)}</span>
        </div>
      </div>
      
      <div className="card-actions" onClick={(e) => e.stopPropagation()}>
        <a 
          href={getWhatsAppLink(client.phone)} 
          target="_blank" 
          rel="noopener noreferrer"
          className="whatsapp-action"
        >
          <MessageCircle size={14} />
          <span>واتساب</span>
        </a>
      </div>
    </div>
  );
};
