import React, { useState } from 'react';
import { Plus, Search, Filter as FilterIcon, MessageCircle, Download } from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { ClientTable } from '../components/Clients/ClientTable';
import { ClientModal } from '../components/Clients/ClientModal';
import { useClients } from '../hooks/useClients';
import { FunnelStage } from '../types';
import type { Client } from '../types';
import { FUNNEL_STAGES, DEFAULT_FOLLOW_UP_DAYS } from '../utils/constants';
import { downloadCsv, csvTimestamp } from '../utils/exportCsv';

export const Clients: React.FC = () => {
  const {
    clients,
    deleteClient,
    updateClient,
    addClient,
    searchClients,
    updateLastContact,
    getStats,
  } = useClients();
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<FunnelStage | ''>('');
  const [followOnly, setFollowOnly] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);

  const stats = getStats();

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
    let list = searchClients(searchQuery, (stageFilter as FunnelStage) || undefined);
    if (followOnly) {
      const ids = new Set(stats.followUpNeeded.map((c) => c.id));
      list = list.filter((c) => ids.has(c.id));
    }
    return list;
  }, [searchClients, searchQuery, stageFilter, clients, followOnly, stats.followUpNeeded]);

  const exportCsv = () => {
    const list = filteredClients.length ? filteredClients : clients;
    downloadCsv(
      `عملاء_${csvTimestamp()}.csv`,
      ['الاسم', 'الهاتف', 'البريد', 'المرحلة', 'المصدر', 'الاهتمام', 'الماركة', 'الموديل', 'آخر تواصل', 'ملاحظات'],
      list.map((c) => [
        c.name,
        c.phone,
        c.email || '',
        FUNNEL_STAGES.find((s) => s.key === c.funnelStage)?.label || c.funnelStage,
        c.source || '',
        c.vehicleInterest || '',
        c.brand || '',
        c.model || '',
        c.lastContactAt ? new Date(c.lastContactAt).toLocaleDateString('ar-DZ') : '',
        c.notes || '',
      ])
    );
  };

  return (
    <div className="animate-fade-in flex-col gap-lg" style={{ display: 'flex', height: '100%' }}>
      <div className="page-header flex justify-between items-center" style={{ marginBottom: 0, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">العملاء</h1>
          <p className="page-description">
            إدارة جهات الاتصال والمتابعة. زر واتساب يفتح المحادثة ويحدّث «آخر تواصل».
            {stats.followUpNeeded.length > 0 && (
              <span style={{ color: '#f59e0b', fontWeight: 600 }}>
                {' '}
                · {stats.followUpNeeded.length} يحتاجون متابعة (بعد {DEFAULT_FOLLOW_UP_DAYS} أيام)
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
          <Button variant="ghost" leftIcon={<Download size={18} />} onClick={exportCsv}>
            تصدير CSV
          </Button>
          <Button variant="primary" leftIcon={<Plus size={18} />} onClick={() => handleOpenModal()}>
            عميل جديد
          </Button>
        </div>
      </div>

      <div className="glass-card flex-col" style={{ flex: 1, display: 'flex' }}>
        <div
          className="flex gap-md justify-between items-center"
          style={{ padding: 'var(--spacing-md)', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap' }}
        >
          <div style={{ width: 'min(300px, 100%)' }}>
            <Input
              placeholder="بحث بالاسم أو الهاتف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={16} />}
            />
          </div>

          <div className="flex items-center gap-sm" style={{ flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setFollowOnly((v) => !v)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 12px',
                borderRadius: 10,
                border: followOnly ? '1px solid #f59e0b' : '1px solid var(--border-color)',
                background: followOnly ? 'rgba(245,158,11,0.15)' : 'transparent',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              <MessageCircle size={16} color={followOnly ? '#f59e0b' : undefined} />
              متابعات فقط ({stats.followUpNeeded.length})
            </button>
            <FilterIcon size={16} color="var(--text-secondary)" />
            <select
              className="input-field"
              style={{ width: '180px' }}
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
          onWhatsApp={(client) => {
            updateLastContact(client.id);
          }}
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
