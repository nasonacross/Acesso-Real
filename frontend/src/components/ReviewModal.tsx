import React, { useState } from 'react';
import { Star, X, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { submitReview } from '../api';
import { useAuth } from '../context/AuthContext';

interface Props {
  establishmentId: string;
  establishmentName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReviewModal: React.FC<Props> = ({
  establishmentId,
  establishmentName,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [wentAccompanied, setWentAccompanied] = useState(false);
  const [conditionTag, setConditionTag] = useState('Pessoa com Deficiência / Mobilidade Reduzida');
  const [barrierInput, setBarrierInput] = useState('');
  const [barriers, setBarriers] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddBarrier = () => {
    if (barrierInput.trim()) {
      setBarriers([...barriers, barrierInput.trim()]);
      setBarrierInput('');
    }
  };

  const handleRemoveBarrier = (index: number) => {
    setBarriers(barriers.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Por favor, escreva um relato sobre sua experiência.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await submitReview(establishmentId, {
        user_id: user.id,
        user_name: user.name,
        user_condition_tag: conditionTag,
        went_accompanied: wentAccompanied,
        rating,
        comment,
        barriers_reported: barriers,
        category_evaluations: {
          physical: rating * 20,
          intellectual: rating * 20,
          sensory: rating * 20,
          visual: rating * 20,
          auditory: rating * 20,
          service: rating * 20,
        },
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar avaliação');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 border border-slate-100 my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          aria-label="Fechar modal"
        >
          <X size={20} />
        </button>

        <h3 className="text-xl font-bold text-slate-900 pr-8">
          Avaliar Acessibilidade Real
        </h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          Local: <strong className="text-slate-700">{establishmentName}</strong>
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Avaliação Geral de Acessibilidade
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 focus:outline-none focus:ring-2 focus:ring-brand-500 rounded"
                  aria-label={`Nota ${star} de 5`}
                >
                  <Star
                    size={28}
                    className={
                      star <= rating
                        ? 'fill-amber-400 text-amber-500'
                        : 'text-slate-300'
                    }
                  />
                </button>
              ))}
              <span className="text-sm font-semibold text-slate-700 ml-2">
                {rating} de 5 estrelas
              </span>
            </div>
          </div>

          {/* Condition Tag */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Como você se identifica para esta avaliação?
            </label>
            <select
              value={conditionTag}
              onChange={(e) => setConditionTag(e.target.value)}
              className="w-full text-xs rounded-lg border-slate-300 border p-2.5 bg-slate-50 text-slate-800"
            >
              <option value="Usuária de Cadeira de Rodas">Usuária de Cadeira de Rodas</option>
              <option value="Pessoa com Mobilidade Reduzida / Idosa">Mobilidade Reduzida / Idosa</option>
              <option value="Pessoa Autista (TEA) / Neurodivergente">Autista (TEA) / Neurodivergente</option>
              <option value="Pessoa Cega ou com Baixa Visão">Cega ou Baixa Visão</option>
              <option value="Pessoa Surda ou com Deficiência Auditiva">Surda / Deficiência Auditiva</option>
              <option value="Pessoa com Deficiência Intelectual">Deficiência Intelectual</option>
              <option value="Acompanhante / Familiar">Acompanhante / Familiar</option>
              <option value="Cidadão Apoiador da Inclusão">Cidadão Apoiador da Inclusão</option>
            </select>
          </div>

          {/* Accompaniment Checkbox */}
          <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <input
              type="checkbox"
              id="went_accompanied"
              checked={wentAccompanied}
              onChange={(e) => setWentAccompanied(e.target.checked)}
              className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
            />
            <label htmlFor="went_accompanied" className="text-xs text-slate-700 font-medium">
              Fui acompanhado(a) por alguém durante esta visita
            </label>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Seu Relato Detalhado (Entrada, circulação, banheiros, atendimento)
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Descreva se encontrou degraus, se a equipe foi prestativa, se havia som alto..."
              className="w-full text-xs rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              required
            />
          </div>

          {/* Report specific barriers */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Encontrou alguma barreira grave no local?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={barrierInput}
                onChange={(e) => setBarrierInput(e.target.value)}
                placeholder="Ex: Degrau de 10cm na entrada sem rampa..."
                className="flex-1 text-xs rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="button"
                onClick={handleAddBarrier}
                className="px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-700"
              >
                Adicionar
              </button>
            </div>
            {barriers.length > 0 && (
              <div className="mt-2 space-y-1">
                {barriers.map((b, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs bg-rose-50 text-rose-800 border border-rose-200 px-2 py-1 rounded"
                  >
                    <span>⚠️ {b}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveBarrier(idx)}
                      className="text-rose-500 hover:text-rose-700 font-bold ml-2"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="pt-2 flex justify-end gap-2">
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
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
            >
              {submitting ? 'Publicando...' : 'Publicar Avaliação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
