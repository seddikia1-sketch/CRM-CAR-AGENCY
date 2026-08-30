import React, { useState } from 'react';
import { PipelineColumn } from '../components/Pipeline/PipelineColumn';
import { useClients } from '../hooks/useClients';
import { FUNNEL_STAGES } from '../utils/constants';
import { FunnelStage } from '../types';
import type { Client } from '../types';
import { ClientModal } from '../components/Clients/ClientModal';

export const Pipeline: React.FC = () => {
  const { getClientsByStage, moveToStage, updateClient } = useClients();
  const clientsByStage = getClientsByStage();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);

  const handleCardClick = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(undefined);
  };

  const handleSaveClient = (data: import('../types').ClientFormData) => {
    if (editingClient) {
      updateClient(editingClient.id, data);
    }
    handleCloseModal();
  };

  const handleDrop = (clientId: string, targetStage: FunnelStage) => {
    moveToStage(clientId, targetStage);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-header" style={{ marginBottom: 'var(--spacing-md)' }}>
        <h1 className="page-title">مراحل المبيعات</h1>
        <p className="page-description">اسحب وأفلت العملاء بين مراحل البيع بسهولة.</p>
      </div>
      
      <div 
        style={{ 
          flex: 1, 
          display: 'flex', 
          gap: 'var(--spacing-md)', 
          overflowX: 'auto',
          paddingBottom: 'var(--spacing-sm)'
        }}
        className="custom-scrollbar"
      >
        {FUNNEL_STAGES.map((stage) => (
          <PipelineColumn
            key={stage.key}
            stageId={stage.key}
            clients={clientsByStage[stage.key] || []}
            onCardClick={handleCardClick}
            onDrop={handleDrop}
          />
        ))}
      </div>

      <ClientModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveClient}
        initialData={editingClient}
        title="تعديل العميل"
      />
    </div>
  );
};
