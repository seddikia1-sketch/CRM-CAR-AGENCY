import React, { useState } from 'react';
import { MoreHorizontal, Edit, Trash2, MessageCircle } from 'lucide-react';
import { FunnelStage } from '../../types';
import type { Client } from '../../types';
import { STAGE_MAP, SOURCE_MAP } from '../../utils/constants';
import {
  formatCurrency,
  formatDate,
  formatPhone,
  getWhatsAppLink,
  formatRelativeTime,
} from '../../utils/formatters';
import { Badge } from '../UI/Badge';
import './ClientTable.css';

interface ClientTableProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
  onUpdateStage: (id: string, stage: FunnelStage) => void;
  onWhatsApp?: (client: Client) => void;
}

function clientWaMessage(client: Client) {
  const car =
    [client.brand, client.model].filter(Boolean).join(' ') || client.vehicleInterest || '';
  if (car) {
    return `السلام عليكم ${client.name}،\nبخصوص ${car} — هل يناسبكم ترتيب معاينة أو إرسال التفاصيل؟\nالمعرض: https://seddikia1-sketch.github.io/CRM-CAR-AGENCY/#/store`;
  }
  return `السلام عليكم ${client.name}،\nنتواصل معكم من معرض السيارات بتندوف.\nالمعرض: https://seddikia1-sketch.github.io/CRM-CAR-AGENCY/#/store`;
}

export const ClientTable: React.FC<ClientTableProps> = ({
  clients,
  onEdit,
  onDelete,
  onUpdateStage,
  onWhatsApp,
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const toggleMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === id ? null : id);
  };

  React.useEffect(() => {
    const closeMenu = () => setActiveMenu(null);
    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener('click', closeMenu);
  }, []);

  if (clients.length === 0) {
    return (
      <div className="empty-state">
        <p>لا يوجد عملاء حالياً.</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="client-table">
        <thead>
          <tr>
            <th>الاسم / الهاتف</th>
            <th>السيارة</th>
            <th>الحالة</th>
            <th>سعر البيع</th>
            <th>المرحلة</th>
            <th>المصدر</th>
            <th>آخر تواصل</th>
            <th className="action-column">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => {
            const stage = STAGE_MAP[client.funnelStage];
            const source = SOURCE_MAP[client.source];
            const carInfo =
              [client.brand, client.model, client.year].filter(Boolean).join(' ') ||
              client.vehicleInterest ||
              '-';

            return (
              <tr key={client.id}>
                <td>
                  <div className="client-name-cell">
                    <p className="client-name">{client.name}</p>
                    <p
                      className="client-phone"
                      dir="ltr"
                      style={{ direction: 'ltr', textAlign: 'left', unicodeBidi: 'isolate' }}
                    >
                      {formatPhone(client.phone)}
                    </p>
                  </div>
                </td>
                <td>
                  <div>
                    <div>{carInfo}</div>
                    {client.mileage > 0 && (
                      <small style={{ color: 'var(--text-secondary)' }}>
                        {client.mileage.toLocaleString()} كم
                      </small>
                    )}
                  </div>
                </td>
                <td>
                  {client.condition === 'new'
                    ? '🆕 جديدة'
                    : client.condition === 'under_3_years'
                      ? '📅 أقل من 3 سنوات'
                      : '-'}
                </td>
                <td>{client.estimatedValue ? formatCurrency(client.estimatedValue) : '-'}</td>
                <td>
                  <Badge color={stage?.color || '#999'} icon={stage?.emoji}>
                    {stage?.label || client.funnelStage}
                  </Badge>
                </td>
                <td>
                  <span className="source-label" title={source?.label}>
                    {source?.emoji} {source?.label}
                  </span>
                </td>
                <td>
                  <div>{formatDate(client.lastContactAt)}</div>
                  <small style={{ color: 'var(--text-secondary)' }}>
                    {formatRelativeTime(client.lastContactAt)}
                  </small>
                </td>
                <td className="action-column relative">
                  <div className="action-buttons">
                    <a
                      href={getWhatsAppLink(client.phone, clientWaMessage(client))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="icon-btn whatsapp-btn"
                      title="واتساب + تحديث آخر تواصل"
                      onClick={(e) => {
                        e.stopPropagation();
                        onWhatsApp?.(client);
                      }}
                    >
                      <MessageCircle size={18} />
                    </a>

                    <button className="icon-btn" onClick={(e) => toggleMenu(client.id, e)}>
                      <MoreHorizontal size={18} />
                    </button>

                    {activeMenu === client.id && (
                      <div
                        className="action-menu glass-card"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="menu-item"
                          onClick={() => {
                            onEdit(client);
                            setActiveMenu(null);
                          }}
                        >
                          <Edit size={16} /> تعديل
                        </button>
                        <button
                          className="menu-item"
                          onClick={() => {
                            onWhatsApp?.(client);
                            window.open(
                              getWhatsAppLink(client.phone, clientWaMessage(client)),
                              '_blank'
                            );
                            setActiveMenu(null);
                          }}
                        >
                          <MessageCircle size={16} /> واتساب
                        </button>
                        <button
                          className="menu-item danger"
                          onClick={() => {
                            onDelete(client.id);
                            setActiveMenu(null);
                          }}
                        >
                          <Trash2 size={16} /> حذف
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
