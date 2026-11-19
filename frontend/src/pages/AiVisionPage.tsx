import React, { useState } from 'react';
import {
  Sparkles,
  Upload,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Info,
  Camera,
  RefreshCw,
  FileCheck
} from 'lucide-react';
import { AIAnalysis } from '../types';
import { analyzeImageAI } from '../api';

export const AiVisionPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<AIAnalysis['category_analyzed']>('entrada');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      setError('Selecione ou fotografe uma imagem antes de analisar.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('category', selectedCategory);

      const data = await analyzeImageAI(formData);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao processar imagem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg space-y-4">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-yellow-300 bg-white/10 px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
          <Sparkles size={15} />
          <span>Módulo Multimodal de Visão Computacional</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          Análise Inteligente de Imagens por IA
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Envie fotografias de entradas, rampas, corredores, banheiros e sinalizações para identificação preliminar de indícios de barreiras de acessibilidade.
        </p>

        {/* Mandatory Technical Disclaimer Banner */}
        <div className="bg-amber-500/20 border border-amber-400/40 p-4 rounded-2xl text-xs text-amber-200 flex items-start gap-3">
          <ShieldAlert size={20} className="text-amber-300 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-amber-100 block">
              DIRETRIZ DE SEGURANÇA & RIGOR TÉCNICO:
            </span>
            <p className="leading-relaxed">
              A inteligência artificial apresenta suas análises como <strong>INDÍCIOS VISUAIS</strong>, nunca como laudo de engenharia ou certificação definitiva da NBR 9050. Não afirmamos inclinações milimétricas sem validação física no local.
            </p>
          </div>
        </div>
      </div>

      {/* Upload and Category Selector Form */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <form onSubmit={handleAnalyze} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tipo de Ambiente / Estrutura na Imagem:
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="w-full text-xs font-semibold py-2.5 px-3 rounded-xl border border-slate-300 bg-slate-50 focus:ring-2 focus:ring-brand-500"
              >
                <option value="entrada">Entrada Principal / Portas</option>
                <option value="rampa">Rampa de Acesso</option>
                <option value="calcada">Calçada / Meio-fio / Travessia</option>
                <option value="corredor">Corredores Internos / Passagens</option>
                <option value="banheiro">Banheiro / Sanitário Adaptado</option>
                <option value="balcao">Balcão de Atendimento / Caixa</option>
                <option value="sinalizacao">Sinalização / Placas / Braille</option>
                <option value="ambiente">Ambiente Geral / Iluminação & Ruído</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Fotografia para Avaliação:
              </label>
              <label className="flex items-center justify-center gap-2 w-full text-xs font-bold py-2.5 px-4 rounded-xl border border-dashed border-brand-400 bg-brand-50 text-brand-700 hover:bg-brand-100 cursor-pointer transition-colors">
                <Camera size={16} />
                <span>{imageFile ? imageFile.name : 'Tirar Foto ou Escolher Arquivo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Image Preview if selected */}
          {previewUrl && (
            <div className="relative max-w-sm mx-auto h-52 rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900">
              <img
                src={previewUrl}
                alt="Pré-visualização da imagem enviada"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading || !imageFile}
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-3 rounded-xl text-xs sm:text-sm shadow-md transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Analisando com Visão Computacional...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Executar Análise de Acessibilidade</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Structured Analysis Results */}
      {result && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm animate-fadeIn">
          {/* Header of analysis */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-brand-700 uppercase tracking-wider block">
                Relatório de Indícios Visuais
              </span>
              <h2 className="text-xl font-bold text-slate-900">
                Resultado da Análise Multimodal
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                {result.confidence_label} ({result.confidence_score}%)
              </span>
            </div>
          </div>

          {/* Grid of Findings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. O que foi identificado */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 size={16} className="text-brand-600" />
                <span>1. O que foi identificado na imagem</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {result.identified_items.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-brand-500 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 2. Possíveis problemas / Barreiras */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
              <div className="flex items-center gap-2 text-amber-950 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle size={16} className="text-amber-600" />
                <span>2. Possíveis problemas identificados</span>
              </div>
              <ul className="space-y-1.5 text-xs text-amber-950">
                {result.potential_barriers.map((barr, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold">⚠️</span>
                    <span>{barr}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. Público potencialmente afetado */}
            <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-2">
              <div className="flex items-center gap-2 text-sky-950 font-bold text-xs uppercase tracking-wider">
                <Info size={16} className="text-sky-600" />
                <span>3. Público potencialmente afetado</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {result.affected_audience.map((aud, i) => (
                  <span
                    key={i}
                    className="text-xs bg-white text-sky-900 px-2.5 py-1 rounded-lg border border-sky-200 font-medium"
                  >
                    {aud}
                  </span>
                ))}
              </div>
            </div>

            {/* 4. Melhorias recomendadas */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
              <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs uppercase tracking-wider">
                <FileCheck size={16} className="text-emerald-600" />
                <span>4. Melhorias recomendadas (Boas Práticas)</span>
              </div>
              <ul className="space-y-1.5 text-xs text-emerald-950">
                {result.recommended_improvements.map((rec, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Technical disclaimer */}
          <div className="p-4 rounded-2xl bg-slate-100 text-[11px] text-slate-600 border border-slate-200 italic">
            {result.disclaimer} • Avaliação gerada em: {new Date(result.created_at).toLocaleString('pt-BR')}
          </div>
        </div>
      )}
    </div>
  );
};
