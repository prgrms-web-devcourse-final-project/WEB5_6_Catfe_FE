'use client';

import { ApplyScope, CreatePlanRequestBody, FrequencyEnum } from '@/@types/planner';
import Button from '@/components/Button';
import { COLOR_ORDER, PLAN_SWATCH } from '@/lib/plannerSwatch';
import tw from '@/utils/tw';
import WeekdayChips from './WeekdayChips';
import { usePlannerForm } from '@/hook/usePlannerForm';
import { useConfirm } from '@/hook/useConfirm';
import { useRef, useState } from 'react';
import SelectScopeChip from './SelectScopeChip';
import useClickOutside from '@/hook/useClickOutside';
import dayjs from 'dayjs';
import showToast from '@/utils/showToast';

export type SubmitPayload = CreatePlanRequestBody & {
  applyScope?: ApplyScope;
};

interface PlanModalProps {
  isEditMode?: boolean;
  selectedYmd: string;
  initial?: Partial<CreatePlanRequestBody>;
  onSubmit: (plan: SubmitPayload) => void;
  onDelete: (scope: { applyScope: ApplyScope }) => void;
  onClose: () => void;
}

function CreatePlanModal({
  isEditMode = false,
  selectedYmd,
  initial,
  onSubmit,
  onDelete,
  onClose,
}: PlanModalProps) {
  const confirm = useConfirm();
  const hasRepeatRule = isEditMode && initial?.repeatRule?.frequency;
  const [deleteScope, setDeleteScope] = useState<ApplyScope>('THIS_ONLY');
  const [showDeleteScope, setShowDeleteScope] = useState(false);
  const [updateScope, setUpdateScope] = useState<ApplyScope>('THIS_ONLY');
  const [showUpdateScope, setShowUpdateScope] = useState(false);

  const deleteScopeRef = useRef<HTMLDivElement>(null);
  const updateScopeRef = useRef<HTMLDivElement>(null);

  useClickOutside(deleteScopeRef, () => {
    if (showDeleteScope) {
      setShowDeleteScope(false);
    }
  });
  useClickOutside(updateScopeRef, () => {
    if (showUpdateScope) {
      setShowUpdateScope(false);
    }
  });

  const {
    subject,
    setSubject,
    color,
    setColor,
    startHM,
    setStartHM,
    endHM,
    setEndHM,
    frequency,
    setFrequency,
    untilDate,
    setUntilDate,
    byDay,
    setByDay,
    timeInvalid,
    disabled,
    getPayload,
  } = usePlannerForm(initial);

  const validateRepeatRule = (payload: CreatePlanRequestBody) => {
    const { repeatRule } = payload;
    if (repeatRule && repeatRule.untilDate) {
      const selectedDate = dayjs(selectedYmd).startOf('day');
      const repeatEndDate = dayjs(repeatRule.untilDate).startOf('day');
      if (repeatEndDate.isBefore(selectedDate, 'day')) {
        showToast('error', '반복 일정의 종료일은 현재 선택된 날짜보다 미래여야 합니다.');
        return false;
      }
    }
    return true;
  };

  // 등록
  const handleSubmit = () => {
    if (disabled) return;
    const payload = getPayload();
    onSubmit(payload);
  };

  // 수정
  const handleInitialUpdateClick = () => {
    if (disabled) return;
    if (!hasRepeatRule) {
      // 단발성 계획 수정
      const payload = getPayload();
      onSubmit(payload);
      onClose();
    } else {
      // 반복 계획일 경우 Scope 선택
      setShowUpdateScope((prev) => !prev);
    }
  };

  // 반복 계획 수정
  const handleUpdate = () => {
    if (disabled) return;
    const payload = getPayload();
    if (!validateRepeatRule(payload)) return;
    if (hasRepeatRule && showUpdateScope) {
      onSubmit({
        ...payload,
        applyScope: updateScope,
      });
    } else {
      onSubmit(payload);
    }
    onClose();
  };

  const handleInitialDeleteClick = () => {
    if (!isEditMode) return;
    if (!hasRepeatRule) {
      // 반복 계획 아닐 경우 바로 삭제
      handleDelete(false);
    } else {
      // 반복 계획일 경우 범위 선택 UI 토글
      setShowDeleteScope((prev) => !prev);
    }
  };

  const handleDelete = async (showScopeUI: boolean) => {
    if (showScopeUI && !deleteScope) return;

    const isConfirmed = await confirm({
      title: hasRepeatRule ? '반복 계획 삭제' : '계획 삭제',
      description: hasRepeatRule ? (
        deleteScope === 'THIS_ONLY' ? (
          <>
            선택된 오늘의 일정을 삭제하시겠습니까?
            <br />
            (이후 반복 일정은 유지됩니다.)
          </>
        ) : (
          <>이 일정과 이후의 모든 반복 일정을 삭제하시겠습니까?</>
        )
      ) : (
        '이 계획을 삭제하시겠습니까?'
      ),
      confirmText: '삭제',
      tone: 'danger',
    });

    if (isConfirmed) {
      if (!hasRepeatRule) {
        onDelete({ applyScope: 'THIS_ONLY' });
      } else {
        onDelete({
          applyScope: deleteScope,
        });
      }
      setShowDeleteScope(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60">
      <div
        role="dialog"
        aria-modal
        className="w-[560px] rounded-xl bg-background-white p-6 shadow-2xl"
        aria-labelledby="plan-modal-title"
      >
        <header className="mb-4 flex items-center justify-between">
          <h3 id="plan-modal-title" className="text-lg font-semibold">
            {isEditMode ? '공부 계획 수정' : '공부 계획 등록'}
          </h3>
          {/* X icon으로 바꿀 것 */}
          <button onClick={onClose} aria-label="닫기" className="rounded p-1 hover:bg-white/10">
            X
          </button>
        </header>

        <div className="space-y-4">
          {/* 주제 */}
          <div className="flex flex-col gap-2">
            <label htmlFor="plan-subject">주제/과목</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="예: 수학 문제 풀기"
              required
              className="w-full rounded-md border border-neutral-700 bg-background-white px-3 py-2 outline-none focus:border-secondary-400"
              maxLength={50}
            />
          </div>
          {/* 시간 */}
          <div className="flex flex-col gap-2">
            <label htmlFor="plan-time">시간 설정</label>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={startHM}
                onChange={(e) => setStartHM(e.target.value)}
                aria-invalid={timeInvalid}
                className={tw(
                  'w-1/3 rounded-md border px-3 py-2',
                  timeInvalid
                    ? 'border-error-500 bg-error-500/10 focus:outline-none'
                    : 'border-neutral-700 bg-background-white focus:outline-none focus:border-secondary-400'
                )}
                step={60}
              />
              <span>~</span>
              <input
                type="time"
                value={endHM}
                onChange={(e) => setEndHM(e.target.value)}
                aria-invalid={timeInvalid}
                className={tw(
                  'w-1/3 rounded-md border px-3 py-2',
                  timeInvalid
                    ? 'border-error-500 bg-error-500/10 focus:outline-none'
                    : 'border-neutral-700 bg-background-white focus:outline-none focus:border-secondary-400'
                )}
                step={60}
              />
            </div>
            {timeInvalid && (
              <p role="alert" aria-live="polite" className="text-xs text-error-500">
                끝나는 시간은 시작 시간보다 앞설 수 없습니다.
              </p>
            )}

            {/* 반복 설정 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <label htmlFor="plan-repeat-rule">반복</label>
                <select
                  id="plan-repeat-rule"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as 'NONE' | FrequencyEnum)}
                  className="w-full rounded-md border border-neutral-700 bg-background-white px-3 py-2"
                >
                  <option value="NONE">반복 없음</option>
                  <option value="DAILY">매일</option>
                  <option value="WEEKLY">매주</option>
                  <option value="MONTHLY">매월</option>
                </select>
              </div>
              {frequency !== 'NONE' && (
                <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                  <div>
                    <label
                      htmlFor="plan-repeat-end"
                      className="mb-1 block text-sm text-text-secondary"
                    >
                      반복 종료일 (선택)
                    </label>
                    <input
                      type="date"
                      value={untilDate}
                      onChange={(e) => setUntilDate(e.target.value)}
                      className="w-full rounded-md border border-neutral-700 bg-background-white px-3 py-2"
                    />
                  </div>
                </div>
              )}
            </div>

            {frequency === 'WEEKLY' && (
              <div className="flex flex-col gap-2">
                <label htmlFor="plan-repeat-day" className="mb-1 block text-sm text-text-secondary">
                  반복 요일 선택
                </label>
                <WeekdayChips id="plan-repeat-day" value={byDay} onChange={setByDay} />
              </div>
            )}

            {/* 색상 */}
            <div className="flex flex-col gap-2 mb-4">
              <label htmlFor="plan-color">표시 색상 선택</label>
              <div className="flex flex-wrap gap-2">
                {COLOR_ORDER.map((i) => {
                  const swatch = PLAN_SWATCH[i];
                  const selected = color === i;
                  return (
                    <button
                      key={i}
                      type="button"
                      className={tw(
                        'h-6 w-6 rounded border',
                        swatch.fill,
                        swatch.border,
                        selected && 'ring-2 ring-offset-2 ring-offset-primary-300 ring-white'
                      )}
                      onClick={() => setColor(i)}
                      aria-label={`color ${i}`}
                      title={i}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-between mt-2 relative">
          {isEditMode && (
            <Button
              borderType="outline"
              color="primary"
              size="sm"
              onClick={handleInitialDeleteClick}
            >
              계획 삭제
            </Button>
          )}
          {isEditMode && hasRepeatRule && showDeleteScope && (
            <div
              className="absolute bottom-full left-0 mb-3 p-3 border-neutral-400 rounded-lg bg-secondary-100 shadow-xl flex flex-col gap-2 z-50"
              ref={deleteScopeRef}
            >
              <label className="sr-only">반복 계획 삭제 범위 선택</label>
              <SelectScopeChip value={deleteScope} onChange={setDeleteScope} />
              <Button
                borderType="solid"
                color="primary"
                size="sm"
                fullWidth
                onClick={() => handleDelete(true)}
                className="mt-2 text-sm"
              >
                선택 범위 삭제
              </Button>
            </div>
          )}
          <div className="flex justify-end gap-2 w-full ml-auto relative">
            <Button borderType="outline" color="secondary" size="sm" onClick={onClose}>
              취소
            </Button>
            <Button
              borderType="solid"
              color="primary"
              size="sm"
              disabled={disabled}
              onClick={isEditMode && hasRepeatRule ? handleInitialUpdateClick : handleSubmit}
            >
              {isEditMode ? '계획 수정' : '계획 등록'}
            </Button>
            {isEditMode && hasRepeatRule && showUpdateScope && (
              <div
                className="absolute bottom-full right-0 mb-3 p-3 border-neutral-400 rounded-lg bg-secondary-100 shadow-xl flex flex-col gap-2 z-50"
                ref={updateScopeRef}
              >
                <label className="sr-only">반복 계획 수정 범위 선택</label>
                <SelectScopeChip value={updateScope} onChange={setUpdateScope} />
                <Button
                  borderType="solid"
                  color="primary"
                  size="sm"
                  fullWidth
                  onClick={handleUpdate}
                  className="mt-2 text-sm"
                >
                  선택 범위 수정
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default CreatePlanModal;
