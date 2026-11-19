import React from 'react';
import {
  Accessibility,
  ShieldCheck,
  CheckCircle2,
  Compass,
  Sparkles,
  Users,
  Eye,
  Ear,
  Brain,
  FileText
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 bg-brand-50 px-3 py-1 rounded-full uppercase tracking-wider">
          <FileText size={15} />
          <span>Metodologia & Transparência Técnica</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Como Funciona o AcessoReal
        </h1>

        <p className="text-xs sm:text-base text-slate-600 leading-relaxed">
          Nossa missão é transformar a acessibilidade em uma <strong>informação pública, verificável, transparente e personalizada</strong>. Acessibilidade não deve ser uma promessa abstrata: deve ser uma informação clara que qualquer pessoa possa consultar antes de sair de casa.
        </p>
      </div>

      {/* The 2 Fundamental Questions */}
      <div className="bg-brand-900 text-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-lg">
        <h2 className="text-xl font-extrabold tracking-tight">
          As Duas Perguntas Fundamentais do AcessoReal
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="bg-white/10 p-5 rounded-2xl border border-white/15 space-y-2 backdrop-blur-sm">
            <span className="text-accent-300 font-bold text-xs uppercase tracking-wider block">
              Pergunta 1:
            </span>
            <p className="font-semibold text-sm leading-relaxed">
              "Este estabelecimento possui acessibilidade suficiente para receber pessoas com diferentes tipos de deficiência?"
            </p>
            <p className="text-xs text-brand-200">
              Respondida através do sistema independente de 0 a 100 pontos dividido nas 6 categorias e com proteção contra barreiras graves.
            </p>
          </div>

          <div className="bg-white/10 p-5 rounded-2xl border border-white/15 space-y-2 backdrop-blur-sm">
            <span className="text-accent-300 font-bold text-xs uppercase tracking-wider block">
              Pergunta 2:
            </span>
            <p className="font-semibold text-sm leading-relaxed">
              "Considerando as necessidades específicas desta pessoa e se ela estará sozinha ou acompanhada, este local oferece condições para sua visita?"
            </p>
            <p className="text-xs text-brand-200">
              Respondida através do <strong>Índice de Compatibilidade Pessoal</strong> e do simulador <strong>"Antes de ir, saiba o que esperar"</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Scoring system & safety guarantee */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider">
          Garantia Antimaquiagem de Acessibilidade
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Muitas plataformas atribuem notas altas apenas porque o local tem uma rampa ou estacionamento preferencial. No AcessoReal:
        </p>
        <ul className="space-y-2 text-xs text-slate-700">
          <li className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Nunca permitimos que uma boa nota em uma categoria esconda uma barreira grave em outra:</strong> Se um supermercado possui nota 90 em atendimento, mas tem degrau sem rampa na entrada, sua classificação geral é automaticamente rebaixada para <em>Acessibilidade limitada</em> ou <em>insuficiente</em>.
            </span>
          </li>
          <li className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Não utilizamos o termo "100% acessível"</strong> sem certificação técnica in loco devidamente documentada.
            </span>
          </li>
          <li className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>A presença de acompanhante não substitui a acessibilidade:</strong> O acompanhante é considerado como viabilizador da visita, mas o local continua sendo avaliado por sua própria autonomia arquitetônica e comunicacional.
            </span>
          </li>
        </ul>
      </div>

      {/* Origin Provenance */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider">
          Transparência da Origem de Cada Dado
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950">
            <strong>Verificado Presencialmente:</strong> Checado por membro treinado da comunidade ou equipe técnica.
          </div>
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-950">
            <strong>Confirmado por Laudo Técnico:</strong> Respaldado por planta ou laudo NBR 9050.
          </div>
          <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-sky-950">
            <strong>Informado por Usuário:</strong> Relato comunitário com foto e moderação.
          </div>
          <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-950">
            <strong>Analisado por IA:</strong> Indício preliminar gerado por visão computacional (sempre rotulado como indício).
          </div>
        </div>
      </div>
    </div>
  );
};
