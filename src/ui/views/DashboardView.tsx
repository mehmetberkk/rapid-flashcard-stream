import React, { useState } from 'react';
import type { Deck, ImportReport } from '../../core/models';
import { useDecks } from '../hooks/useDecks';
import { DeckCard } from '../components/DeckCard';
import { CsvImportDropzone } from '../components/CsvImportDropzone';
import { ImportReportModal } from '../components/ImportReportModal';
import { Plus, Upload, Zap, BookOpen } from 'lucide-react';

interface DashboardViewProps {
  onSelectDeck: (deck: Deck) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onSelectDeck }) => {
  const { decks, isLoading, createDeck, deleteDeck, reloadDecks } = useDecks();

  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newDeckName, setNewDeckName] = useState<string>('');
  const [newDeckDesc, setNewDeckDesc] = useState<string>('');
  const [activeReport, setActiveReport] = useState<ImportReport | null>(null);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeckName.trim()) return;
    await createDeck(newDeckName, newDeckDesc);
    setNewDeckName('');
    setNewDeckDesc('');
    setIsCreateModalOpen(false);
  };

  const handleImportComplete = async (report: ImportReport) => {
    setIsImportModalOpen(false);
    setActiveReport(report);
    await reloadDecks();
  };

  return (
    <div className="min-h-screen bg-surface-950 text-slate-100 flex flex-col p-6 sm:p-10 select-none">
      {/* Header bar */}
      <header className="max-w-6xl mx-auto w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 border-b border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-2xl shadow-lg shadow-indigo-500/25">
            <Zap className="w-6 h-6 fill-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Rapid Flashcard Stream
            </h1>
            <p className="text-xs text-slate-400">
              Yüksek Hızlı Kelime Tarama & Sabit Odaklı Öğrenme
            </p>
          </div>
        </div>

        {/* Top actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 text-sm font-medium rounded-xl transition"
          >
            <Upload className="w-4 h-4 text-indigo-400" />
            <span>CSV İçe Aktar</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Deste</span>
          </button>
        </div>
      </header>

      {/* Main content grid */}
      <main className="max-w-6xl mx-auto w-full flex-1 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Desteleriniz ({decks.length})</span>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-slate-500 text-sm animate-pulse">
            Desteler yükleniyor...
          </div>
        ) : decks.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-slate-800 rounded-3xl p-8 space-y-4 max-w-lg mx-auto">
            <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl w-fit mx-auto">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Henüz Bir Deste Yok</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Kelimelerinizi hızla taramak için hemen bir CSV dosyası yükleyin veya boş bir deste oluşturun.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition"
              >
                CSV Yükle
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {decks.map((deck) => (
              <DeckCard
                key={deck.id}
                deck={deck}
                onSelectDeck={onSelectDeck}
                onDeleteDeck={deleteDeck}
              />
            ))}
          </div>
        )}
      </main>

      {/* Manual Create Deck Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-fade-in">
            <h3 className="text-lg font-bold text-white">Yeni Deste Oluştur</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Deste Adı</label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                  placeholder="Örn: YDS Phrasal Verbs"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Açıklama (İsteğe bağlı)</label>
                <textarea
                  value={newDeckDesc}
                  onChange={(e) => setNewDeckDesc(e.target.value)}
                  placeholder="Deste hakkında kısa notlar..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={!newDeckName.trim()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition"
                >
                  Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-xl">
            <CsvImportDropzone
              onImportComplete={handleImportComplete}
              onCancel={() => setIsImportModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Import Report Diagnostics Modal */}
      <ImportReportModal
        report={activeReport}
        onClose={() => setActiveReport(null)}
      />
    </div>
  );
};

