'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api/admin';
import { getErrorStatus } from '@/lib/errors';
import {
  BannedWord,
  SuspiciousWord,
  BannedWordCategory,
  SuspiciousWordCategory,
  BANNED_WORD_CATEGORY_LABELS,
  SUSPICIOUS_WORD_CATEGORY_LABELS
} from '@/types';
import {
  ShieldAlert,
  AlertTriangle,
  Plus,
  Trash2,
  Search,
  Filter,
  Loader2,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

type TabType = 'banned' | 'suspicious';

export default function ModerationPage() {
  const [activeTab, setActiveTab] = useState<TabType>('banned');
  const [bannedWords, setBannedWords] = useState<BannedWord[]>([]);
  const [suspiciousWords, setSuspiciousWords] = useState<SuspiciousWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // 새 단어 추가 모달 상태
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [newCategory, setNewCategory] = useState<string>('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = async () => {
    setLoading(true);
    try {
      const [bannedRes, suspiciousRes] = await Promise.all([
        adminApi.getBannedWords(),
        adminApi.getSuspiciousWords(),
      ]);
      setBannedWords(bannedRes.words);
      setSuspiciousWords(suspiciousRes.words);
    } catch (error) {
      // 401 에러는 조용히 무시
      if (getErrorStatus(error) !== 401) {
        toast.error('단어 목록을 불러오는데 실패했습니다');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newWord.trim()) {
      toast.error('단어를 입력해주세요');
      return;
    }
    if (!newCategory) {
      toast.error('카테고리를 선택해주세요');
      return;
    }

    setAdding(true);
    try {
      if (activeTab === 'banned') {
        const res = await adminApi.addBannedWord({ word: newWord.trim(), category: newCategory });
        setBannedWords(prev => [...prev, res.word]);
        toast.success('금지어가 추가되었습니다');
      } else {
        const res = await adminApi.addSuspiciousWord({ word: newWord.trim(), category: newCategory });
        setSuspiciousWords(prev => [...prev, res.word]);
        toast.success('의심 키워드가 추가되었습니다');
      }
      setShowAddModal(false);
      setNewWord('');
      setNewCategory('');
    } catch (error) {
      // 401 에러는 조용히 무시
      if (getErrorStatus(error) !== 401) {
        toast.error('이미 등록된 단어입니다');
      }
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string, type: TabType) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      if (type === 'banned') {
        await adminApi.deleteBannedWord(id);
        setBannedWords(prev => prev.filter(w => w.id !== id));
        toast.success('금지어가 삭제되었습니다');
      } else {
        await adminApi.deleteSuspiciousWord(id);
        setSuspiciousWords(prev => prev.filter(w => w.id !== id));
        toast.success('의심 키워드가 삭제되었습니다');
      }
    } catch (error) {
      // 401 에러는 조용히 무시
      if (getErrorStatus(error) !== 401) {
        toast.error('삭제에 실패했습니다');
      }
    }
  };

  const currentWords = activeTab === 'banned' ? bannedWords : suspiciousWords;
  const categoryLabels = activeTab === 'banned' ? BANNED_WORD_CATEGORY_LABELS : SUSPICIOUS_WORD_CATEGORY_LABELS;
  const categories = activeTab === 'banned' ? Object.values(BannedWordCategory) : Object.values(SuspiciousWordCategory);

  const filteredWords = currentWords.filter(word => {
    const matchesSearch = word.word.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || word.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // 카테고리별로 그룹화
  const groupedWords = filteredWords.reduce((acc, word) => {
    const cat = word.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(word);
    return acc;
  }, {} as Record<string, typeof filteredWords>);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">콘텐츠 필터 관리</h1>
        <p className="text-slate-500 mt-1">
          상품 등록 시 자동으로 검사되는 금지어와 의심 키워드를 관리합니다
        </p>
      </div>

      {/* 탭 */}
      <div className="flex space-x-4 border-b border-slate-200">
        <button
          onClick={() => {
            setActiveTab('banned');
            setSelectedCategory('');
            setSearchTerm('');
          }}
          className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
            activeTab === 'banned'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <ShieldAlert className="w-5 h-5" />
          <span className="font-medium">금지어</span>
          <span className={`px-2 py-0.5 text-xs rounded-full ${
            activeTab === 'banned' ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-600'
          }`}>
            {bannedWords.length}
          </span>
        </button>
        <button
          onClick={() => {
            setActiveTab('suspicious');
            setSelectedCategory('');
            setSearchTerm('');
          }}
          className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
            activeTab === 'suspicious'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <AlertTriangle className="w-5 h-5" />
          <span className="font-medium">의심 키워드</span>
          <span className={`px-2 py-0.5 text-xs rounded-full ${
            activeTab === 'suspicious' ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-600'
          }`}>
            {suspiciousWords.length}
          </span>
        </button>
      </div>

      {/* 설명 */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-start space-x-3">
          {activeTab === 'banned' ? (
            <ShieldAlert className="w-5 h-5 text-slate-500 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-slate-500 mt-0.5" />
          )}
          <div>
            <h3 className="font-medium text-slate-800">
              {activeTab === 'banned' ? '금지어란?' : '의심 키워드란?'}
            </h3>
            <p className="text-sm mt-1 text-slate-600">
              {activeTab === 'banned'
                ? '금지어가 포함된 상품은 자동으로 검토 대기 상태가 됩니다. 관리자가 승인해야 게시됩니다.'
                : '의심 키워드가 3개 이상 포함된 상품은 자동으로 검토 대기 상태가 됩니다.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="단어 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          >
            <option value="">전체 카테고리</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {categoryLabels[cat as keyof typeof categoryLabels]}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => {
            setShowAddModal(true);
            setNewCategory(categories[0]);
          }}
          className="flex items-center space-x-2 px-4 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>추가</span>
        </button>
      </div>

      {/* 단어 목록 */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : filteredWords.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 bg-slate-100">
            {activeTab === 'banned' ? (
              <ShieldAlert className="w-8 h-8 text-slate-500" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-slate-500" />
            )}
          </div>
          <p className="text-slate-500">
            {searchTerm || selectedCategory ? '검색 결과가 없습니다' : '등록된 단어가 없습니다'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedWords).map(([category, words]) => (
            <div key={category} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 border-b bg-slate-50 border-slate-200">
                <h3 className="font-semibold text-slate-800">
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </h3>
                <p className="text-sm text-slate-500">{words.length}개</p>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  {words.map(word => (
                    <div
                      key={word.id}
                      className="group flex items-center space-x-2 px-3 py-1.5 rounded-full border transition-all bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    >
                      <span className="text-sm font-medium">{word.word}</span>
                      <button
                        onClick={() => handleDelete(word.id, activeTab)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded-full hover:bg-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                {activeTab === 'banned' ? '금지어 추가' : '의심 키워드 추가'}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  단어
                </label>
                <input
                  type="text"
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  placeholder="추가할 단어를 입력하세요"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  카테고리
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {categoryLabels[cat as keyof typeof categoryLabels]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleAdd}
                disabled={adding}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50"
              >
                {adding ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span>추가</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
