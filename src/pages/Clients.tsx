import React, { useState } from 'react';
import { Plus, Search, Filter as FilterIcon } from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { ClientTable } from '../components/Clients/ClientTable';
import { ClientModal } from '../components/Clients/ClientModal';
import { useClients } from '../hooks/useClients';
import { FunnelStage } from '../types';
import type { Client } from '../types';
import { FUNNEL_STAGES } from '../utils/constants';

export const Clients: React.FC = () => {
  const { clients, deleteClient, updateClient, addClient, searchClients } = useClients();
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<FunnelStage | ''>('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);

  const handleOpenModal = (client?: Client) => {
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
    } else {
      addClient(data);
    }
    handleCloseModal();
  };

  const filteredClients = React.useMemo(() => {
    return searchClients(searchQuery, stageFilter as FunnelStage || undefined);
  }, [searchClients, searchQuery, stageFilter, clients]);

  return (
    <div className="animate-fade-in flex-col gap-lg" style={{ display: 'flex', height: '100%' }}>
      <div className="page-header flex justify-between items-center" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">العملاء</h1>
          <p className="page-description">إدارة جميع جهات الاتصال والفرص في مكان واحد.</p>
        </div>
        <Button variant="primary" leftIcon={<Plus size={18} />} onClick={() => handleOpenModal()}>
          عميل جديد
        </Button>
      </div>

      <div className="glass-card flex-col" style={{ flex: 1, display: 'flex' }}>
        <div className="flex gap-md justify-between items-center" style={{ padding: 'var(--spacing-md)', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ width: '300px' }}>
            <Input
              placeholder="بحث بالاسم أو الهاتف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={16} />}
            />
          </div>
          
          <div className="flex items-center gap-sm">
            <FilterIcon size={16} color="var(--text-secondary)" />
            <select 
              className="input-field" 
              style={{ width: '200px' }}
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value as FunnelStage | '')}
            >
              <option value="">كل المراحل</option>
              {FUNNEL_STAGES.map((stage) => (
                <option key={stage.key} value={stage.key}>
                  {stage.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <ClientTable 
          clients={filteredClients}
          onEdit={handleOpenModal}
          onDelete={(id) => {
            if (window.confirm('هل أنت متأكد من حذف هذا العميل؟')) {
              deleteClient(id);
            }
          }}
          onUpdateStage={(id, stage) => updateClient(id, { funnelStage: stage })}
        />
      </div>

      <ClientModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveClient}
        initialData={editingClient}
        title={editingClient ? 'تعديل العميل' : 'عميل جديد'}
      />
    </div>
  );
};
