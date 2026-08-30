import React, { useState } from 'react';
import { AttachmentData } from './TicketDetailView';
import { useRequester } from '../context/RequesterContext';

interface AttachmentSectionProps {
  ticketId: number;
  attachments: AttachmentData[];
  onAttachmentChanged: () => void;
}

export const AttachmentSection: React.FC<AttachmentSectionProps> = ({
  ticketId,
  attachments,
  onAttachmentChanged,
}) => {
  const { selectedRequester } = useRequester();

  // Active & Soft-removed files filtering
  const activeAttachments = attachments.filter((a) => !a.isRemoved);
  const removedAttachments = attachments.filter((a) => a.isRemoved);

  // Soft Removal Modal State
  const [targetAttachment, setTargetAttachment] = useState<AttachmentData | null>(null);
  const [removalReason, setRemovalReason] = useState<string>('');
  const [removalError, setRemovalError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<boolean>(false);

  // Add Attachment Modal State
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  // Download Handler (BR-12, BR-13)
  const handleDownload = async (attachment: AttachmentData) => {
    if (!selectedRequester) return;
    if (attachment.isRemoved) {
      alert('Download Blocked: This file has been soft-removed.');
      return;
    }

    try {
      const downloadUrl = `http://localhost:5000/api/attachments/${attachment.id}/download?requesterId=${selectedRequester.id}`;
      const response = await fetch(downloadUrl);

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to download file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Download Error: ${err.message}`);
    }
  };

  // Submit Soft Removal Handler (BR-12)
  const handleConfirmRemoval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAttachment || !selectedRequester) return;

    const trimmed = removalReason.trim();
    if (!trimmed || trimmed.length < 3) {
      setRemovalError('Removal reason is required (at least 3 characters).');
      return;
    }

    setRemoving(true);
    setRemovalError(null);

    try {
      const res = await fetch(`http://localhost:5000/api/attachments/${targetAttachment.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterId: selectedRequester.id,
          removalReason: trimmed,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to remove attachment');
      }

      // Close modal and refresh list
      setTargetAttachment(null);
      setRemovalReason('');
      onAttachmentChanged();
    } catch (err: any) {
      setRemovalError(err.message || 'Error occurred while removing attachment');
    } finally {
      setRemoving(false);
    }
  };

  // Submit Upload Attachment Handler (BR-09, BR-10, BR-11)
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !selectedRequester) return;

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('requesterId', String(selectedRequester.id));
      formData.append('attachments', selectedFile);

      const res = await fetch(`http://localhost:5000/api/tickets/${ticketId}/attachments`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload attachment');
      }

      // Close modal and refresh list
      setShowUploadModal(false);
      setSelectedFile(null);
      onAttachmentChanged();
    } catch (err: any) {
      setUploadError(err.message || 'Error occurred while uploading attachment');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div style={styles.card}>
      {/* Header Row */}
      <div style={styles.headerRow}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.2rem' }}>📎</span>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#006B3C', fontWeight: 700 }}>
            Attachments ({activeAttachments.length})
          </h3>
        </div>

        {/* BR-11: Add Attachment button available if active attachments < 5 */}
        {activeAttachments.length < 5 && (
          <button onClick={() => setShowUploadModal(true)} style={styles.addBtn}>
            + Add Attachment
          </button>
        )}
      </div>

      {/* Active Attachments List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {activeAttachments.length === 0 ? (
          <div style={styles.emptyBox}>No active attachments for this ticket.</div>
        ) : (
          activeAttachments.map((att) => (
            <div key={att.id} style={styles.activeAttachmentItem}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.1rem' }}>📄</span>
                <div>
                  <div style={{ fontWeight: 600, color: '#1F2937', fontSize: '0.9rem' }}>{att.fileName}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{formatFileSize(att.fileSize)}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => handleDownload(att)} style={styles.downloadBtn}>
                  ⬇ Download
                </button>
                <button
                  onClick={() => {
                    setTargetAttachment(att);
                    setRemovalReason('');
                    setRemovalError(null);
                  }}
                  style={styles.removeBtn}
                >
                  🗑 Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Soft-Removed Attachments List (BR-12) */}
      {removedAttachments.length > 0 && (
        <div style={{ marginTop: '16px', borderTop: '1px dashed #E5E7EB', paddingTop: '16px' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#6B7280', textTransform: 'uppercase' }}>
            Soft-Removed Attachments ({removedAttachments.length})
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {removedAttachments.map((att) => (
              <div key={att.id} style={styles.removedAttachmentItem}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1rem', opacity: 0.5 }}>🚫</span>
                  <div>
                    <span style={{ textDecoration: 'line-through', color: '#9CA3AF', fontWeight: 600, fontSize: '0.875rem' }}>
                      {att.fileName}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#9CA3AF', marginLeft: '8px' }}>
                      ({formatFileSize(att.fileSize)})
                    </span>
                    <div style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '2px' }}>
                      Reason: <em>"{att.removalReason}"</em>
                    </div>
                  </div>
                </div>

                <span style={styles.removedBadge}>Soft-Removed (Download Disabled)</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Soft Removal Confirmation Modal (BR-12) */}
      {targetAttachment && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <h3 style={{ margin: '0 0 8px 0', color: '#DC2626', fontSize: '1.25rem' }}>Confirm Attachment Soft-Removal</h3>
            <p style={{ fontSize: '0.875rem', color: '#4B5563', margin: '0 0 16px 0' }}>
              Are you sure you want to remove <strong>{targetAttachment.fileName}</strong>?<br />
              The file metadata will remain visible as a removed record, but downloading will be disabled.
            </p>

            {removalError && <div style={styles.modalErrorBox}>⚠️ {removalError}</div>}

            <form onSubmit={handleConfirmRemoval}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1F2937', marginBottom: '6px' }}>
                Removal Reason <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Enter valid reason for removing this attachment (e.g., Uploaded incorrect file version)..."
                value={removalReason}
                onChange={(e) => {
                  setRemovalReason(e.target.value);
                  if (removalError) setRemovalError(null);
                }}
                style={styles.modalTextarea}
                required
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setTargetAttachment(null)}
                  disabled={removing}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button type="submit" disabled={removing} style={styles.confirmRemoveBtn}>
                  {removing ? 'Removing...' : 'Confirm Soft Removal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Attachment Modal */}
      {showUploadModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <h3 style={{ margin: '0 0 8px 0', color: '#006B3C', fontSize: '1.25rem' }}>Add Attachment to Ticket</h3>
            <p style={{ fontSize: '0.85rem', color: '#4B5563', margin: '0 0 16px 0' }}>
              Allowed types: JPG, PNG, WEBP, PDF (Max 5 MB).
            </p>

            {uploadError && <div style={styles.modalErrorBox}>⚠️ {uploadError}</div>}

            <form onSubmit={handleUploadSubmit}>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                    setUploadError(null);
                  }
                }}
                style={styles.fileInput}
                required
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  disabled={uploading}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button type="submit" disabled={uploading || !selectedFile} style={styles.uploadSubmitBtn}>
                  {uploading ? 'Uploading...' : 'Upload Attachment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 10px rgba(0, 107, 60, 0.05)',
    border: '1px solid #E5E7EB',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  addBtn: {
    backgroundColor: '#EAF6EF',
    color: '#006B3C',
    border: '1px solid #B8E2C8',
    padding: '6px 14px',
    borderRadius: '6px',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  emptyBox: {
    padding: '16px',
    backgroundColor: '#F9FAFB',
    borderRadius: '8px',
    color: '#6B7280',
    fontSize: '0.875rem',
    textAlign: 'center',
    border: '1px dashed #D1D5DB',
  },
  activeAttachmentItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: '#F9FAFB',
    borderRadius: '8px',
    border: '1px solid #E5E7EB',
  },
  downloadBtn: {
    backgroundColor: '#006B3C',
    color: '#FFFFFF',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  removeBtn: {
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
    border: '1px solid #FCA5A5',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  removedAttachmentItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    backgroundColor: '#F3F4F6',
    borderRadius: '8px',
    border: '1px solid #E5E7EB',
  },
  removedBadge: {
    fontSize: '0.75rem',
    color: '#6B7280',
    backgroundColor: '#E5E7EB',
    padding: '4px 8px',
    borderRadius: '4px',
    fontWeight: 600,
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '16px',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '28px',
    maxWidth: '480px',
    width: '100%',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
  },
  modalErrorBox: {
    padding: '10px 12px',
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
    borderRadius: '6px',
    fontSize: '0.85rem',
    marginBottom: '12px',
  },
  modalTextarea: {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #D1D5DB',
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  fileInput: {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: '1px dashed #006B3C',
    backgroundColor: '#EAF6EF',
    boxSizing: 'border-box',
  },
  cancelBtn: {
    padding: '8px 16px',
    borderRadius: '6px',
    border: '1px solid #D1D5DB',
    backgroundColor: '#FFFFFF',
    color: '#374151',
    fontWeight: 600,
    cursor: 'pointer',
  },
  confirmRemoveBtn: {
    padding: '8px 18px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#DC2626',
    color: '#FFFFFF',
    fontWeight: 600,
    cursor: 'pointer',
  },
  uploadSubmitBtn: {
    padding: '8px 18px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#006B3C',
    color: '#FFFFFF',
    fontWeight: 600,
    cursor: 'pointer',
  },
};
