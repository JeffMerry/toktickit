import React, { useState, useEffect } from 'react';
import { useRequester } from '../context/RequesterContext';

interface CategoryOption {
  id: number;
  name: string;
  description?: string;
}

interface RelatedSystemOption {
  id: number;
  name: string;
  description?: string;
}

interface CreateTicketFormProps {
  onSuccess?: (ticketNumber: string) => void;
  onCancel?: () => void;
}

export const CreateTicketForm: React.FC<CreateTicketFormProps> = ({ onSuccess, onCancel }) => {
  const { selectedRequester } = useRequester();

  // Form Field States
  const [categoryId, setCategoryId] = useState<string>('');
  const [relatedSystemId, setRelatedSystemId] = useState<string>('');
  const [requestedPriority, setRequestedPriority] = useState<string>('MEDIUM');
  const [summary, setSummary] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [files, setFiles] = useState<File[]>([]);

  // Reference Data States
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [relatedSystems, setRelatedSystems] = useState<RelatedSystemOption[]>([]);
  const [loadingRefData, setLoadingRefData] = useState<boolean>(true);

  // Form Feedback States
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);

  // Fetch Categories & Related Systems on Mount
  useEffect(() => {
    const fetchRefData = async () => {
      setLoadingRefData(true);
      setApiError(null);
      try {
        const [catRes, sysRes] = await Promise.all([
          fetch('http://localhost:5000/api/categories'),
          fetch('http://localhost:5000/api/related-systems'),
        ]);

        if (!catRes.ok || !sysRes.ok) {
          throw new Error('Failed to load form reference data');
        }

        const catData: CategoryOption[] = await catRes.json();
        const sysData: RelatedSystemOption[] = await sysRes.json();

        setCategories(catData);
        setRelatedSystems(sysData);

        if (catData.length > 0) setCategoryId(String(catData[0].id));
        if (sysData.length > 0) setRelatedSystemId(String(sysData[0].id));
      } catch (err: any) {
        console.error('Error loading reference data:', err);
        setApiError('Unable to load Categories or Related Systems. Please check backend connection.');
      } finally {
        setLoadingRefData(false);
      }
    };

    fetchRefData();
  }, []);

  // Handle File Selection with Client Validations (BR-09, BR-10, BR-11)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    let fileError = '';

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    const maxSizeBytes = 5 * 1024 * 1024; // 5 MB

    const validNewFiles: File[] = [];

    for (const file of selectedFiles) {
      if (!allowedTypes.includes(file.type)) {
        fileError = `File "${file.name}" has an invalid type. Only JPG, PNG, WEBP, and PDF are allowed.`;
        break;
      }
      if (file.size > maxSizeBytes) {
        fileError = `File "${file.name}" exceeds the 5 MB size limit.`;
        break;
      }
      validNewFiles.push(file);
    }

    if (fileError) {
      setErrors((prev) => ({ ...prev, attachments: fileError }));
      return;
    }

    // Check Total Count (Max 5 files)
    if (files.length + validNewFiles.length > 5) {
      setErrors((prev) => ({ ...prev, attachments: 'Maximum 5 attachments allowed per ticket.' }));
      return;
    }

    setErrors((prev) => ({ ...prev, attachments: '' }));
    setFiles((prev) => [...prev, ...validNewFiles]);
    e.target.value = ''; // Reset input
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    if (errors.attachments) setErrors((prev) => ({ ...prev, attachments: '' }));
  };

  // Client-side Validation (BR-05, BR-06, BR-07, BR-08)
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!categoryId) {
      newErrors.categoryId = 'Please select a Category';
    }

    if (!relatedSystemId) {
      newErrors.relatedSystemId = 'Please select a Related System';
    }

    const trimmedSummary = summary.trim();
    if (!trimmedSummary) {
      newErrors.summary = 'Summary is required';
    } else if (trimmedSummary.length < 5) {
      newErrors.summary = 'Summary must be at least 5 characters';
    } else if (trimmedSummary.length > 100) {
      newErrors.summary = 'Summary cannot exceed 100 characters';
    }

    const trimmedDesc = description.trim();
    if (!trimmedDesc) {
      newErrors.description = 'Description is required';
    } else if (trimmedDesc.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (trimmedDesc.length > 2000) {
      newErrors.description = 'Description cannot exceed 2000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) return;
    if (!selectedRequester) {
      setApiError('No active Development Requester selected.');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('requesterId', String(selectedRequester.id));
      formData.append('categoryId', categoryId);
      formData.append('relatedSystemId', relatedSystemId);
      formData.append('requestedPriority', requestedPriority);
      formData.append('summary', summary.trim());
      formData.append('description', description.trim());

      files.forEach((file) => {
        formData.append('attachments', file);
      });

      const res = await fetch('http://localhost:5000/api/tickets', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit ticket');
      }

      // Success callback passing ticketNumber
      if (onSuccess) onSuccess(data.ticketNumber);
    } catch (err: any) {
      console.error('Submit ticket error:', err);
      // Safe Error State: preserve form values and show error message
      setApiError(err.message || 'Network error occurred. Form values preserved.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingRefData) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={{ color: '#0B7A46', fontWeight: 500 }}>Loading form options from database...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.formTitle}>Create IT Support Ticket</h2>
      <p style={styles.formSubtitle}>
        Fill in the details below to submit a new ticket for <strong>{selectedRequester?.name}</strong>.
      </p>

      {apiError && (
        <div style={styles.apiErrorBox}>
          <span>⚠️ {apiError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Classification Group: Category & Related System */}
        <div style={styles.row}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              Category <span style={styles.asterisk}>*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                if (errors.categoryId) setErrors((prev) => ({ ...prev, categoryId: '' }));
              }}
              style={{
                ...styles.select,
                ...(errors.categoryId ? styles.inputErrorBorder : {}),
              }}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <span style={styles.fieldErrorMessage}>{errors.categoryId}</span>}
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              Related System <span style={styles.asterisk}>*</span>
            </label>
            <select
              value={relatedSystemId}
              onChange={(e) => {
                setRelatedSystemId(e.target.value);
                if (errors.relatedSystemId) setErrors((prev) => ({ ...prev, relatedSystemId: '' }));
              }}
              style={{
                ...styles.select,
                ...(errors.relatedSystemId ? styles.inputErrorBorder : {}),
              }}
            >
              {relatedSystems.map((sys) => (
                <option key={sys.id} value={sys.id}>
                  {sys.name}
                </option>
              ))}
            </select>
            {errors.relatedSystemId && <span style={styles.fieldErrorMessage}>{errors.relatedSystemId}</span>}
          </div>
        </div>

        {/* Priority Selection */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>
            Requested Priority <span style={styles.asterisk}>*</span>
          </label>
          <div style={styles.priorityGroup}>
            {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((priority) => (
              <label
                key={priority}
                style={{
                  ...styles.priorityRadioLabel,
                  ...(requestedPriority === priority ? styles.prioritySelected : {}),
                }}
              >
                <input
                  type="radio"
                  name="requestedPriority"
                  value={priority}
                  checked={requestedPriority === priority}
                  onChange={(e) => setRequestedPriority(e.target.value)}
                  style={{ marginRight: '6px' }}
                />
                {priority}
              </label>
            ))}
          </div>
        </div>

        {/* Summary Input */}
        <div style={styles.fieldGroup}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={styles.label}>
              Ticket Summary <span style={styles.asterisk}>*</span>
            </label>
            <span style={styles.charCount}>{summary.length}/100</span>
          </div>
          <input
            type="text"
            placeholder="Briefly describe your problem (e.g., Cannot connect to Campus Wi-Fi)"
            value={summary}
            maxLength={100}
            onChange={(e) => {
              setSummary(e.target.value);
              if (errors.summary) setErrors((prev) => ({ ...prev, summary: '' }));
            }}
            style={{
              ...styles.input,
              ...(errors.summary ? styles.inputErrorBorder : {}),
            }}
          />
          {errors.summary && <span style={styles.fieldErrorMessage}>{errors.summary}</span>}
        </div>

        {/* Description Textarea */}
        <div style={styles.fieldGroup}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={styles.label}>
              Description <span style={styles.asterisk}>*</span>
            </label>
            <span style={styles.charCount}>{description.length}/2000</span>
          </div>
          <textarea
            rows={5}
            placeholder="Provide detailed information about the issue, error messages, and steps to reproduce..."
            value={description}
            maxLength={2000}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
            }}
            style={{
              ...styles.textarea,
              ...(errors.description ? styles.inputErrorBorder : {}),
            }}
          />
          {errors.description && <span style={styles.fieldErrorMessage}>{errors.description}</span>}
        </div>

        {/* Attachment Upload Section (BR-09, BR-10, BR-11) */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Supporting Attachments (Optional)</label>
          <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: '0 0 8px 0' }}>
            Allowed types: <strong>JPG, PNG, WEBP, PDF</strong>. Max 5 MB per file. Up to 5 files per ticket.
          </p>

          <input
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.webp,.pdf"
            onChange={handleFileChange}
            disabled={files.length >= 5}
            style={styles.fileInput}
          />

          {errors.attachments && <span style={styles.fieldErrorMessage}>{errors.attachments}</span>}

          {/* Uploaded File List */}
          {files.length > 0 && (
            <div style={styles.fileList}>
              {files.map((file, idx) => (
                <div key={idx} style={styles.fileItem}>
                  <span style={styles.fileName}>
                    📎 {file.name} <small style={{ color: '#6B7280' }}>({(file.size / (1024 * 1024)).toFixed(2)} MB)</small>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(idx)}
                    style={styles.removeFileBtn}
                    title="Remove file"
                  >
                    ✖
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={styles.buttonRow}>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              style={styles.cancelBtn}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={submitting}
            style={{
              ...styles.submitBtn,
              ...(submitting ? styles.submitBtnDisabled : {}),
            }}
          >
            {submitting ? 'Submitting Ticket...' : 'Submit Ticket'}
          </button>
        </div>
      </form>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '32px',
    boxShadow: '0 2px 12px rgba(0, 107, 60, 0.06)',
    border: '1px solid #E5E7EB',
  },
  formTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#006B3C',
    margin: '0 0 4px 0',
  },
  formSubtitle: {
    fontSize: '0.875rem',
    color: '#4B5563',
    margin: '0 0 24px 0',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
  },
  fieldGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#1F2937',
    marginBottom: '6px',
  },
  asterisk: {
    color: '#DC2626',
  },
  select: {
    width: '100%',
    padding: '10px 14px',
    fontSize: '0.95rem',
    borderRadius: '8px',
    border: '1px solid #D1D5DB',
    backgroundColor: '#FFFFFF',
    color: '#1F2937',
    outline: 'none',
    boxSizing: 'border-box',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    fontSize: '0.95rem',
    borderRadius: '8px',
    border: '1px solid #D1D5DB',
    backgroundColor: '#FFFFFF',
    color: '#1F2937',
    outline: 'none',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '10px 14px',
    fontSize: '0.95rem',
    borderRadius: '8px',
    border: '1px solid #D1D5DB',
    backgroundColor: '#FFFFFF',
    color: '#1F2937',
    outline: 'none',
    resize: 'vertical',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  fileInput: {
    display: 'block',
    width: '100%',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px dashed #B8E2C8',
    backgroundColor: '#EAF6EF',
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
  fileList: {
    marginTop: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  fileItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    borderRadius: '6px',
    backgroundColor: '#F9FAFB',
    border: '1px solid #E5E7EB',
    fontSize: '0.85rem',
  },
  fileName: {
    fontWeight: 500,
    color: '#1F2937',
  },
  removeFileBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#DC2626',
    cursor: 'pointer',
    fontWeight: 700,
    padding: '2px 6px',
  },
  charCount: {
    fontSize: '0.75rem',
    color: '#6B7280',
  },
  inputErrorBorder: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  fieldErrorMessage: {
    display: 'block',
    fontSize: '0.8rem',
    color: '#DC2626',
    marginTop: '4px',
  },
  priorityGroup: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  priorityRadioLabel: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid #D1D5DB',
    backgroundColor: '#F9FAFB',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#374151',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'all 0.2s',
  },
  prioritySelected: {
    backgroundColor: '#EAF6EF',
    borderColor: '#006B3C',
    color: '#006B3C',
  },
  apiErrorBox: {
    padding: '12px 16px',
    borderRadius: '8px',
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
    border: '1px solid #FCA5A5',
    marginBottom: '20px',
    fontSize: '0.9rem',
  },
  buttonRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '28px',
  },
  cancelBtn: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: '1px solid #D1D5DB',
    backgroundColor: '#FFFFFF',
    color: '#374151',
    fontWeight: 600,
    cursor: 'pointer',
  },
  submitBtn: {
    padding: '11px 28px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#006B3C',
    color: '#FFFFFF',
    fontWeight: 600,
    fontSize: '0.95rem',
    cursor: 'pointer',
  },
  submitBtnDisabled: {
    backgroundColor: '#9CA3AF',
    cursor: 'not-allowed',
  },
  loadingContainer: {
    padding: '40px',
    textAlign: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #EAF6EF',
    borderTop: '3px solid #006B3C',
    borderRadius: '50%',
    margin: '0 auto 12px auto',
  },
};
