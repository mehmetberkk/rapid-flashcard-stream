import React, { useState, useRef } from 'react';
import { csvParser } from '../../core/parser/CsvParser';
import { storageRepository } from '../../core/storage/StorageRepository';
import type { ImportReport } from '../../core/models';
import { UploadCloud, FileText, Loader2 } from 'lucide-react';

interface CsvImportDropzoneProps {
  onImportComplete: (report: ImportReport) => void;
  onCancel?: () => void;
}

export const CsvImportDropzone: React.FC<CsvImportDropzoneProps> = ({
  onImportComplete,
  onCancel
}) => {
  const [deckName, setDeckName] = useState<string>('');
  const [delimiter, setDelimiter] = useState<',' | ';' | '\t' | 'auto'>('auto');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!deckName.trim()) {
        const defaultName = file.name.replace(/\.[^/.]+$/, '');
        setDeckName(defaultName);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      if (!deckName.trim()) {
        const defaultName = file.name.replace(/\.[^/.]+$/, '');
        setDeckName(defaultName);
      }
    }
  };

  const handleProcessImport = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);

    try {
      const text = await selectedFile.text();
      const parseResult = csvParser.parse(text, selectedFile.name, { delimiter });

      const finalDeckName = deckName.trim() || selectedFile.name.replace(/\.[^/.]+$/, '');
      const newDeck = await storageRepository.createDeck({ name: finalDeckName });

      if (parseResult.importedCards.length > 0) {
        await storageRepository.bulkAddCards(
          parseResult.importedCards.map((c) => ({
            deckId: newDeck.id,
            front: c.front,
            back: c.back,
            orderIndex: c.orderIndex
          }))
        );
      }

      const report: ImportReport = {
        fileName: parseResult.fileName,
        totalLines: parseResult.totalLines,
        importedCount: parseResult.importedCards.length,
        skippedCount: parseResult.errors.length,
        errors: parseResult.errors,
        timestamp: Date.now(),
        detectedDelimiter: parseResult.detectedDelimiter
      };

      onImportComplete(report);
    } catch (err) {
      console.error('Import failed:', err);
      alert('Dosya okunurken veya kaydedilirken hata oluştu.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-white">Yeni Deste İçe Aktar</h3>
        <p className="text-xs text-slate-400">
          CSV veya TSV formatında iki sütunlu (Kelime, Anlam) kelime listenizi yükleyin.
        </p>
      </div>

      {/* Deste Adı Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300">Deste Adı</label>
        <input
          type="text"
          value={deckName}
          onChange={(e) => setDeckName(e.target.value)}
          placeholder="Örn: YDS Hedef Kelimeler 2026"
          className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
        />
      </div>

      {/* Delimiter Selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300">Sütun Ayırıcı</label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: 'auto', label: 'Otomatik' },
            { id: ',', label: 'Virgül (,)' },
            { id: ';', label: 'Noktalı Virgül (;)' },
            { id: '\t', label: 'Sekme (Tab)' }
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setDelimiter(item.id as any)}
              className={`py-2 px-3 text-xs font-medium rounded-xl border transition ${
                delimiter === item.id
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dropzone Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 ${
          isDragging
            ? 'border-indigo-500 bg-indigo-500/5'
            : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.tsv,.txt"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl">
          <UploadCloud className="w-8 h-8" />
        </div>
        <div>
          {selectedFile ? (
            <div className="flex items-center gap-2 text-indigo-300 font-medium text-sm">
              <FileText className="w-4 h-4" />
              <span>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
            </div>
          ) : (
            <>
              <p className="text-sm font-medium text-slate-200">
                Dosyayı buraya sürükleyin veya <span className="text-indigo-400 underline">seçin</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">.CSV, .TSV veya .TXT desteklenir</p>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white rounded-xl transition"
          >
            İptal
          </button>
        )}
        <button
          type="button"
          onClick={handleProcessImport}
          disabled={!selectedFile || isProcessing}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm rounded-xl transition shadow-lg shadow-indigo-600/20"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Ayrıştırılıyor...</span>
            </>
          ) : (
            <span>İçe Aktar ve Oluştur</span>
          )}
        </button>
      </div>
    </div>
  );
};

