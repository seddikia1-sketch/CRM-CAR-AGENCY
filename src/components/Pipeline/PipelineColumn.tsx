import React from 'react';
import { FunnelStage } from '../../types';
import type { Client } from '../../types';
import { FUNNEL_STAGES } from '../../utils/constants';
import { PipelineCard } from './PipelineCard';
import { formatCurrency } from '../../utils/formatters';
import './PipelineColumn.css';

interface PipelineColumnProps {
  stageId: FunnelStage;
  clients: Client[];
  onCardClick: (client: Client) => void;
  onDrop: (clientId: string, targetStage: FunnelStage) => void;
}

export const PipelineColumn: React.FC<PipelineColumnProps> = ({ 
  stageId, 
  clients, 
  onCardClick,
  onDrop
}) => {
  const stageInfo = FUNNEL_STAGES.find(s => s.key === stageId);
  
  if (!stageInfo) return null;

  const totalValue = clients.reduce((sum, client) => sum + (client.estimatedValue || 0), 0);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const clientId = e.dataTransfer.getData('text/plain');
    if (clientId) {
      onDrop(clientId, stageId);
    }
  };

  const handleDragStart = (e: React.DragEvent, clientId: string) => {
    e.dataTransfer.setData('text/plain', clientId);
  };

  return (
    <div 
      className="pipeline-column"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div 
        className="column-header" 
        style={{ borderTopColor: stageInfo.color }}
      >
        <div className="column-title-wrapper">
          <span className="column-emoji">{stageInfo.emoji}</span>
          <h3 className="column-title">{stageInfo.label}</h3>
          <span className="column-count">{clients.length}</span>
        </div>
        
        {totalValue > 0 && (
          <div className="column-value">
            {formatCurrency(totalValue)}
          </div>
        )}
      </div>
      
      <div className="column-content custom-scrollbar">
        {clients.length === 0 ? (
          <div className="column-empty">
            <p>لا يوجد عملاء</p>
          </div>
        ) : (
          clients.map(client => (
            <PipelineCard 
              key={client.id} 
              client={client} 
              onClick={() => onCardClick(client)}
              onDragStart={handleDragStart}
            />
          ))
        )}
      </div>
    </div>
  );
};
