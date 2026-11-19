import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { submitReport } from '../api';
import { useAuth } from '../context/AuthContext';

interface Props {
  establishmentId: string;
  establishmentName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModal: React.FC<Props> = ({
  establishmentId,
  establishmentName,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const [reason, setReason] = useState('Informação desatualizada');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await submitReport({
        establishment_id: establishmentId,
        reason,
        description,
        reported_by_user_id: user.id,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Falha ao enviar reporte');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          aria-label="Fechar"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-2 text-amber-600 mb-2">
          <AlertTriangle size={22} />
          <h3 className="text-lg font-bold text-slate-900">
            Reportar Informação Incorreta
          </h3>
        </div>

        <p className="text-xs text-slate-500 mb-4">
          Local: <strong className="text-slate-700">{establishmentName}</strong>
        </p>

        {success ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle2 size={40} className="text-emerald-500 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">Denúncia enviada!</h4>
            <p className="text-xs text-slate-600">
              Nossa equipe de moderação irá analisar e atualizar as condições do local.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-2.5 rounded bg-rose-50 text-rose-800 text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Motivo do reporte
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full text-xs rounded-lg border-slate-300 border p-2.5 bg-slate-50"
              >
                <option value="Informação desatualizada">Informação desatualizada</option>
                <option value="Rampa inexistente ou inadequada">Rampa inexistente ou inadequada</option>
                <option value="Banheiro adaptado fechado ou sem acesso">Banheiro adaptado fechado ou sem acesso</option>
                <option value="Atendimento discriminatório">Atendimento discriminatório</option>
                <option value="Local fechou permanentemente">Local fechou permanentemente</option>
                <option value="Outro">Outro motivo</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Explique o que mudou ou está incorreto
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: A rampa foi interditada por obras e agora só há degraus na entrada..."
                className="w-full text-xs rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow disabled:opacity-50"
              >
                {submitting ? 'Enviando...' : 'Enviar Reporte'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
