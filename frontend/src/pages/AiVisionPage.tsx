import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Info,
  Camera,
  RefreshCw,
  FileCheck,
  Image as ImageIcon,
  Sun,
  Contrast,
  Eye,
  Clock
} from 'lucide-react';
import { AIAnalysis } from '../types';
import { analyzeImageAI, fetchAiHistory } from '../api';

interface OpticalMetrics {
  width: number;
  height: number;
  brightness: number;
  contrast: number;
  glarePercent: number;
}

// Compute real pixel-level optical diagnostics on an uploaded image using HTML5 Canvas
async function extractOpticalMetrics(file: File): Promise<OpticalMetrics> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const sampleW = Math.min(200, img.naturalWidth || 200);
        const sampleH = Math.min(200, img.naturalHeight || 200);
        canvas.width = sampleW;
        canvas.height = sampleH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(url);
          resolve({ width: img.naturalWidth, height: img.naturalHeight, brightness: 55, contrast: 45, glarePercent: 5 });
          return;
        }

        ctx.drawImage(img, 0, 0, sampleW, sampleH);
        const data = ctx.getImageData(0, 0, sampleW, sampleH).data;
        const totalPixels = sampleW * sampleH;
        let lumSum = 0;
        let glareCount = 0;
        const lums: number[] = [];

        for (let i = 0; i < data.length; i += 4) {
          const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          lums.push(lum);
          lumSum += lum;
          if (lum > 242) glareCount++;
        }

        const meanLum = lumSum / totalPixels;
        let varianceSum = 0;
        for (let i = 0; i < lums.length; i++) {
          const diff = lums[i] - meanLum;
          varianceSum += diff * diff;
        }
        const stdDev = Math.sqrt(varianceSum / totalPixels);

        URL.revokeObjectURL(url);
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight,
          brightness: Math.round((meanLum / 255) * 100),
          contrast: Math.min(100, Math.round((stdDev / 95) * 100)),
          glarePercent: Math.round((glareCount / totalPixels) * 100),
        });
      } catch (_e) {
        URL.revokeObjectURL(url);
        resolve({ width: img.naturalWidth, height: img.naturalHeight, brightness: 55, contrast: 45, glarePercent: 5 });
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ width: 800, height: 600, brightness: 55, contrast: 45, glarePercent: 5 });
    };
    img.src = url;
  });
}

export const AiVisionPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<AIAnalysis['category_analyzed']>('entrada');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [opticalMetrics, setOpticalMetrics] = useState<OpticalMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIAnalysis | null>(null);
  const [history, setHistory] = useState<AIAnalysis[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const list = await fetchAiHistory();
      setHistory(list.slice(0, 6));
    } catch (_e) {
      // ignore
    }
  };

  const processSelectedFile = async (file: File) => {
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setError(null);
    const metrics = await extractOpticalMetrics(file);
    setOpticalMetrics(metrics);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const handleLoadSample = async (samplePath: string, sampleName: string, cat: AIAnalysis['category_analyzed']) => {
    try {
      setError(null);
      setSelectedCategory(cat);
      const res = await fetch(samplePath);
      const blob = await res.blob();
      const file = new File([blob], sampleName, { type: blob.type || 'image/jpeg' });
      await processSelectedFile(file);
    } catch (_e) {
      setError('Não foi possível carregar a foto de exemplo.');
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      setError('Selecione, tire uma foto ou escolha um exemplo antes de analisar.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('category', selectedCategory);
      if (opticalMetrics) {
        formData.append('optical_metrics', JSON.stringify(opticalMetrics));
      }

      const data = await analyzeImageAI(formData);
      setResult(data);
      await loadHistory();
    } catch (err: any) {
      setError(err.message || 'Erro ao processar imagem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-fade-in">
      {/* Header */}
      <div className="mesh-hero text-white p-6 sm:p-8 rounded-[2rem] shadow-elevated border border-white/10 space-y-4">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-white/10 px-3.5 py-1.5 rounded-full uppercase tracking-wider backdrop-blur-md border border-white/15">
          <Sparkles size={15} />
          <span>Visão Computacional & Análise Óptica</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          IA Visão — Análise Inteligente de Imagens
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Envie ou tire uma foto pelo celular de entradas, rampas, calçadas, banheiros e sinalizações para medir luminosidade, contraste, reflexos e identificar indícios preliminares de barreiras.
        </p>

        <div className="bg-amber-500/15 border border-amber-400/30 p-4 rounded-2xl text-xs text-amber-100 flex items-start gap-3">
          <ShieldAlert size={20} className="text-amber-300 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-extrabold text-amber-200 block">
              DIRETRIZ DE TRANSPARÊNCIA TÉCNICA:
            </span>
            <p className="leading-relaxed text-amber-100/90">
              A IA apresenta <strong>INDÍCIOS VISUAIS</strong> combinando análise óptica da fotografia e diretrizes da NBR 9050, nunca substituindo medição física ou laudo oficial.
            </p>
          </div>
        </div>
      </div>

      {/* Upload & Optical Preview Form */}
      <div className="surface-card p-6 sm:p-8 space-y-6">
        <form onSubmit={handleAnalyze} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                Estrutura / Ambiente na Fotografia:
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="w-full text-xs sm:text-sm font-semibold py-3 px-3.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:ring-2 focus:ring-brand-500"
              >
                <option value="entrada">Entrada Principal / Portas</option>
                <option value="rampa">Rampa de Acesso</option>
                <option value="calcada">Calçada / Meio-fio / Travessia</option>
                <option value="corredor">Corredores Internos / Passagens</option>
                <option value="banheiro">Banheiro / Sanitário Adaptado</option>
                <option value="balcao">Balcão de Atendimento / Caixa</option>
                <option value="sinalizacao">Sinalização / Placas / Braille</option>
                <option value="ambiente">Ambiente Geral / Iluminação & Sensorial</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                Capturar ou Enviar Fotografia:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center justify-center gap-1.5 text-xs font-bold py-3 px-3 rounded-xl border border-dashed border-brand-400 bg-brand-50 text-brand-700 hover:bg-brand-100 cursor-pointer transition-colors">
                  <Camera size={16} />
                  <span>Câmera</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                <label className="flex items-center justify-center gap-1.5 text-xs font-bold py-3 px-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors">
                  <ImageIcon size={16} />
                  <span>Galeria / PC</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Quick Sample Photos to Test Immediately */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-bold text-slate-500 block">
              Ou teste agora com fotos reais da plataforma:
            </span>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleLoadSample('/images/establishments/est_apae.jpg', 'fachada_apae.jpg', 'entrada')}
                className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 font-bold transition-colors"
              >
                📸 Entrada APAE
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample('/images/establishments/est_poupatempo.jpg', 'poupatempo.jpg', 'rampa')}
                className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 font-bold transition-colors"
              >
                📸 Acesso Poupatempo
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample('/images/establishments/fatec_facade.jpg', 'campus_ensino.jpg', 'calcada')}
                className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 font-bold transition-colors"
              >
                📸 Calçada / Campus
              </button>
            </div>
          </div>

          {/* Image Preview & Live Optical Telemetry */}
          {previewUrl && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="relative max-w-md mx-auto h-56 rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900">
                <img
                  src={previewUrl}
                  alt="Pré-visualização da imagem enviada"
                  className="w-full h-full object-cover"
                />
                {imageFile && (
                  <span className="absolute bottom-2 left-2 bg-slate-950/75 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md">
                    {imageFile.name}
                  </span>
                )}
              </div>

              {opticalMetrics && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-500 flex items-center justify-center gap-1">
                      <Sun size={12} className="text-amber-500" /> Luminosidade
                    </span>
                    <strong className="text-sm font-extrabold text-slate-900">{opticalMetrics.brightness}%</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-500 flex items-center justify-center gap-1">
                      <Contrast size={12} className="text-brand-600" /> Contraste
                    </span>
                    <strong className="text-sm font-extrabold text-slate-900">{opticalMetrics.contrast}%</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-500 flex items-center justify-center gap-1">
                      <Eye size={12} className="text-violet-600" /> Reflexo / Brilho
                    </span>
                    <strong className="text-sm font-extrabold text-slate-900">{opticalMetrics.glarePercent}%</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-500 block">Resolução</span>
                    <strong className="text-xs font-extrabold text-slate-900">
                      {opticalMetrics.width}×{opticalMetrics.height}
                    </strong>
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={loading || !imageFile}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-brand-600 text-white font-extrabold px-7 py-3.5 rounded-2xl text-xs sm:text-sm shadow-md transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Processando Visão Computacional...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} className="text-accent-400" />
                  <span>Executar Análise de Acessibilidade</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Analysis Result */}
      {result && (
        <div className="surface-card p-6 sm:p-8 space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-extrabold text-brand-600 uppercase tracking-wider block">
                Relatório de Indícios Visuais
              </span>
              <h2 className="text-xl font-extrabold text-slate-900">
                Resultado da Análise Multimodal
              </h2>
            </div>

            <span className="text-xs font-extrabold px-3.5 py-1.5 rounded-full bg-brand-50 text-brand-800 border border-brand-200 self-start sm:self-auto">
              {result.confidence_label} ({result.confidence_score}%)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-xs uppercase tracking-wider">
                <CheckCircle2 size={16} className="text-brand-600" />
                <span>1. O que foi identificado</span>
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

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
              <div className="flex items-center gap-2 text-amber-950 font-extrabold text-xs uppercase tracking-wider">
                <AlertTriangle size={16} className="text-amber-600" />
                <span>2. Indícios de barreiras</span>
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

            <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-2">
              <div className="flex items-center gap-2 text-sky-950 font-extrabold text-xs uppercase tracking-wider">
                <Info size={16} className="text-sky-600" />
                <span>3. Público potencialmente afetado</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {result.affected_audience.map((aud, i) => (
                  <span
                    key={i}
                    className="text-xs bg-white text-sky-900 px-2.5 py-1 rounded-lg border border-sky-200 font-semibold"
                  >
                    {aud}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
              <div className="flex items-center gap-2 text-emerald-950 font-extrabold text-xs uppercase tracking-wider">
                <FileCheck size={16} className="text-emerald-600" />
                <span>4. Melhorias recomendadas</span>
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

          <div className="p-4 rounded-2xl bg-slate-100/80 text-[11px] text-slate-600 border border-slate-200/80 italic">
            {result.disclaimer} • Gerado em: {new Date(result.created_at).toLocaleString('pt-BR')}
          </div>
        </div>
      )}

      {/* Recent Analyses History */}
      {history.length > 0 && (
        <div className="surface-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-slate-800 font-extrabold text-xs uppercase tracking-wider">
            <Clock size={15} className="text-brand-600" />
            <span>Histórico Recente de Análises ({history.length})</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => setResult(item)}
                className="p-3.5 rounded-2xl border border-slate-200/80 hover:border-brand-300 bg-slate-50/70 hover:bg-white cursor-pointer transition-all flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold uppercase text-brand-600 block">
                    {item.category_analyzed} • {item.confidence_score}% confiança
                  </span>
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {item.potential_barriers[0] || item.identified_items[0]}
                  </p>
                  <span className="text-[10px] text-slate-500">
                    {new Date(item.created_at).toLocaleString('pt-BR')}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-brand-600 shrink-0">Ver</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
