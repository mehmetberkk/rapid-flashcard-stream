import React from 'react';
import type { ImportReport } from '../../core/models';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

interface ImportReportModalProps {
  report: ImportReport | null;
  onClose: () => void;
}

export const ImportReportModal: React.FC<ImportReportModalProps> = ({ report, onClose }) => {
  if (!report) return null;

  const hasErrors = report.errors.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${hasErrors ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
              {hasErrors ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">İçe Aktarma Tamamlandı</h3>
              <p className="text-xs text-slate-400 font-mono">{report.fileName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 p-6 bg-slate-950/50 border-b border-slate-800 text-center">
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
            <div className="text-2xl font-bold font-mono text-white">{report.totalLines}</div>
            <div className="text-xs text-slate-400">Toplam Satır</div>
          </div>
          <div className="bg-emerald-950/20 p-3 rounded-xl border border-emerald-900/30">
            <div className="text-2xl font-bold font-mono text-emerald-400">{report.importedCount}</div>
            <div className="text-xs text-emerald-300/80">Başarılı Kart</div>
          </div>
          <div className={`p-3 rounded-xl border ${hasErrors ? 'bg-amber-950/20 border-amber-900/30' : 'bg-slate-900/80 border-slate-800/80'}`}>
            <div className={`text-2xl font-bold font-mono ${hasErrors ? 'text-amber-400' : 'text-slate-400'}`}>
              {report.skippedCount}
            </div>
            <div className={`text-xs ${hasErrors ? 'text-amber-300/80' : 'text-slate-400'}`}>Atlanan Satır</div>
          </div>
        </div>

        {/* Error diagnostics list */}
        <div className="p-6 flex-1 overflow-y-auto">
          {hasErrors ? (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Atlanan / Hatalı Satırlar ({report.errors.length})
              </h4>
              <div className="space-y-2">
                {report.errors.map((err, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-semibold text-amber-400">Satır #{err.lineNumber}</span>
                      <span className="text-slate-400">{err.reason}</span>
                    </div>
                    {err.rawContent && (
                      <div className="bg-slate-900 p-2 rounded text-slate-400 font-mono truncate">
                        {err.rawContent}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-sm">
              Tüm satırlar başarıyla ayrıştırıldı ve desteye eklendi!
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end bg-slate-950/40">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium text-sm transition"
          >
            Anladım, Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

