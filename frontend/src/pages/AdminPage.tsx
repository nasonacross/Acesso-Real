import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building,
  Users,
  MessageSquare,
  Sparkles,
  TrendingUp,
  RefreshCw,
  Eye
} from 'lucide-react';
import { fetchAdminDashboard, updateReviewStatusAdmin, updateReportStatusAdmin } from '../api';

export const AdminPage: React.FC = () => {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminDashboard();
      setDashboard(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleModerateReview = async (id: string, status: 'aprovada' | 'rejeitada') => {
    try {
      await updateReviewStatusAdmin(id, status);
      setActionMsg(`Avaliação ${status === 'aprovada' ? 'aprovada' : 'rejeitada'} com sucesso.`);
      await loadData();
      setTimeout(() => setActionMsg(null), 3000);
    } catch (err) {
      alert('Erro ao moderar avaliação.');
    }
  };

  const handleModerateReport = async (id: string, status: 'resolvido' | 'rejeitado') => {
    try {
      await updateReportStatusAdmin(id, status);
      setActionMsg(`Denúncia marcada como ${status}.`);
      await loadData();
      setTimeout(() => setActionMsg(null), 3000);
    } catch (err) {
      alert('Erro ao moderar denúncia.');
    }
  };

  if (loading || !dashboard) {
    return (
      <div className="py-12 space-y-4">
        <div className="h-8 w-44 bg-slate-200 rounded animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-28 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const { kpis, recent_reviews, recent_reports, recent_ai } = dashboard;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 animate-fade-in">
      {/* Title */}
      <div className="mesh-hero text-white p-6 sm:p-8 rounded-[2rem] shadow-elevated border border-white/10 space-y-3">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-300 bg-white/10 border border-white/15 px-3 py-1 rounded-full uppercase tracking-wider">
          <ShieldAlert size={15} />
          <span>Painel de Governança & Moderação</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Painel de Controle AcessoReal
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
          Supervisão em tempo real de estabelecimentos, fila de moderação colaborativa, relatórios de barreiras e auditoria de inteligência artificial.
        </p>

        {actionMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{actionMsg}</span>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Estabelecimentos
          </span>
          <span className="text-3xl font-extrabold text-slate-900">
            {kpis.total_establishments}
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold block">
            {kpis.total_verified} verificados presencialmente
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Avaliações da Comunidade
          </span>
          <span className="text-3xl font-extrabold text-brand-600">
            {kpis.total_reviews}
          </span>
          <span className="text-[11px] text-slate-500 block">
            Total de relatos auditados
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Denúncias Pendentes
          </span>
          <span className="text-3xl font-extrabold text-rose-600">
            {kpis.total_reports_pending}
          </span>
          <span className="text-[11px] text-rose-500 block">
            Barreiras não resolvidas
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Análises de IA
          </span>
          <span className="text-3xl font-extrabold text-purple-600">
            {kpis.total_ai_analyses}
          </span>
          <span className="text-[11px] text-purple-500 block">
            Processadas por visão comp.
          </span>
        </div>
      </div>

      {/* Moderation Queue for Reviews */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
              Fila de Moderação de Avaliações
            </h2>
            <p className="text-xs text-slate-500">
              Garante que as informações publicadas sejam respeitosas, verídicas e livres de discurso discriminatório.
            </p>
          </div>
          <button
            onClick={loadData}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <RefreshCw size={13} />
            <span>Atualizar</span>
          </button>
        </div>

        <div className="space-y-3">
          {recent_reviews.map((rev: any) => (
            <div
              key={rev.id}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900">{rev.user_name}</span>
                  <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded text-slate-700">
                    {rev.user_condition_tag}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    rev.status === 'aprovada' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {rev.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleModerateReview(rev.id, 'aprovada')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1"
                >
                  <CheckCircle2 size={14} />
                  <span>Aprovar</span>
                </button>
                <button
                  onClick={() => handleModerateReview(rev.id, 'rejeitada')}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs flex items-center gap-1"
                >
                  <XCircle size={14} />
                  <span>Rejeitar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reports Queue */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
          Denúncias e Avisos de Inconsistência ({recent_reports.length})
        </h2>

        {recent_reports.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">Nenhuma denúncia pendente de resolução.</p>
        ) : (
          <div className="space-y-3">
            {recent_reports.map((rep: any) => (
              <div
                key={rep.id}
                className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-rose-900">Motivo: {rep.reason}</span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(rep.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700">{rep.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleModerateReport(rep.id, 'resolvido')}
                    className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg text-xs"
                  >
                    Marcar Resolvido
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Vision Audit Log */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
          Auditoria de Análises por Inteligência Artificial
        </h2>
        <div className="space-y-2">
          {recent_ai.map((item: any) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
            >
              <div>
                <strong className="text-slate-900 block">
                  Categoria: {item.category_analyzed.toUpperCase()}
                </strong>
                <span className="text-slate-500">
                  Confiança: {item.confidence_score}% ({item.confidence_label}) • {item.potential_barriers.length} barreiras identificadas
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                {new Date(item.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
