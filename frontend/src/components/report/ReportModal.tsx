'use client';

import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import type { ReportReason, ReportTargetType } from '@/types';
import { reportsApi } from '@/lib/api/reports';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: ReportTargetType;
  targetId: string;
  targetName: string;
}

interface ReportReasonOption {
  value: ReportReason;
  label: string;
  description: string;
}

const REPORT_REASONS: ReportReasonOption[] = [
  {
    value: 'SPAM',
    label: '스팸/광고',
    description: '스팸성 게시물 또는 광고성 콘텐츠',
  },
  {
    value: 'FRAUD',
    label: '사기 의심',
    description: '사기 행위가 의심되는 경우',
  },
  {
    value: 'INAPPROPRIATE',
    label: '부적절한 콘텐츠',
    description: '욕설, 음란물 등 부적절한 내용',
  },
  {
    value: 'PROHIBITED_ITEM',
    label: '금지된 물품',
    description: '판매가 금지된 물품',
  },
  {
    value: 'FAKE',
    label: '가품/위조품',
    description: '가품 또는 위조품 판매',
  },
  {
    value: 'OTHER',
    label: '기타',
    description: '기타 사유',
  },
];

export default function ReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetName,
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!selectedReason) {
      toast.error('신고 사유를 선택해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      await reportsApi.createReport({
        target_type: targetType,
        target_id: targetId,
        reason: selectedReason,
        description: description.trim() || undefined,
      });

      toast.success('신고가 접수되었습니다. 검토 후 조치하겠습니다.');
      onClose();
      setSelectedReason(null);
      setDescription('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || '신고 접수에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setSelectedReason(null);
      setDescription('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <h2 className="text-lg font-semibold">
              {targetType === 'USER' ? '사용자' : '상품'} 신고
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600">
              신고 대상: <span className="font-medium text-gray-900">{targetName}</span>
            </p>
          </div>

          {/* Reason Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              신고 사유 <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {REPORT_REASONS.map((reason) => (
                <label
                  key={reason.value}
                  className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedReason === reason.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={reason.value}
                    checked={selectedReason === reason.value}
                    onChange={(e) => setSelectedReason(e.target.value as ReportReason)}
                    disabled={isSubmitting}
                    className="mt-0.5 h-4 w-4 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {reason.label}
                    </div>
                    <div className="text-xs text-gray-500">
                      {reason.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              상세 설명 (선택사항)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              placeholder="신고 사유에 대한 자세한 설명을 입력해주세요."
              rows={4}
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 resize-none"
            />
            <p className="text-xs text-gray-500 text-right">
              {description.length} / 500
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              허위 신고 시 서비스 이용이 제한될 수 있습니다. 신중하게 신고해주세요.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end space-x-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedReason}
          >
            {isSubmitting ? '신고 중...' : '신고하기'}
          </Button>
        </div>
      </div>
    </div>
  );
}
