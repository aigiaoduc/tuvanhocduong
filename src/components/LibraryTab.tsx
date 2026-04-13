import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { fetchLibraryData, LibraryItem } from '../services/sheet';
import { BookOpen, Loader2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Markdown from 'react-markdown';

export default function LibraryTab() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const itemsPerPage = 4;

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchLibraryData();
      setItems(data);
      setLoading(false);
    };
    loadData();
  }, []);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = items.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4">
      <div className="mb-6 flex items-center gap-3">
        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-primary">Cẩm Nang Tâm Lý</h2>
          <p className="text-sm text-muted-foreground">Những bài viết và mẹo nhỏ giúp em cân bằng cảm xúc</p>
        </div>
      </div>

      <ScrollArea className="flex-1 bg-white rounded-2xl shadow-sm border p-4 sm:p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-emerald-500" />
            <p>Đang tải cẩm nang...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <BookOpen className="w-12 h-12 mb-4 opacity-20" />
            <p>Chưa có bài viết nào trong cẩm nang.</p>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="grid gap-6 md:grid-cols-2 flex-1">
              {currentItems.map((item) => (
                <div key={item.id} className="bg-slate-50 rounded-xl overflow-hidden border border-slate-100 hover:shadow-md transition-shadow flex flex-col">
                  <div className="p-4 bg-emerald-50/50 border-b border-emerald-100 shrink-0">
                    <h3 className="font-semibold text-emerald-800">{item.title}</h3>
                  </div>
                  <div className="p-4 flex-1 overflow-auto">
                    {item.type === 'image' ? (
                      <img 
                        src={item.content} 
                        alt={item.title} 
                        className="w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                        referrerPolicy="no-referrer"
                        onClick={() => setSelectedImage(item.content)}
                      />
                    ) : (
                      <div className="prose prose-sm prose-emerald max-w-none text-slate-700 prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0">
                        <Markdown>{item.content.replace(/\\n/g, '\n')}</Markdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8 pt-4 border-t border-slate-100 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Trước
                </Button>
                <span className="text-sm font-medium text-slate-600">
                  Trang {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="gap-1"
                >
                  Sau <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-pointer animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl w-full h-full flex items-center justify-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full z-10"
              onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
            >
              <X className="w-6 h-6" />
            </Button>
            <img 
              src={selectedImage} 
              alt="Phóng to" 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}
    </div>
  );
}
