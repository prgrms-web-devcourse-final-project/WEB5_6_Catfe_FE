'use client';

import { CreatePlanRequestBody, FrequencyEnum } from '@/@types/planner';
import Button from '@/components/Button';
import { COLOR_ORDER, PLAN_SWATCH } from '@/lib/plannerSwatch';
import tw from '@/utils/tw';
import WeekdayChips from './WeekdayChips';
import { usePlannerForm } from '@/hook/usePlannerForm';

interface PlanModalProps {
  isEditMode?: boolean;
  initial?: Partial<CreatePlanRequestBody>;
  onSubmit: (plan: CreatePlanRequestBody) => void;
  onClose: () => void;
}

function CreatePlanModal({ isEditMode = false, initial, onSubmit, onClose }: PlanModalProps) {
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

  const handleSubmit = () => {
    if (disabled) return;
    onSubmit(getPayload());
  };

  // !! 임시 html : createPortal 로 변경할 것
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
            {isEditMode ? '공부 계획 등록' : '공부 계획 수정'}
          </h3>
          {/* X icon으로 바꿀 것 */}
          <button onClick={onClose} aria-label="닫기" className="rounded p-1 hover:bg-white/10">
            X
          </button>
        </header>
        <div className="space-y-4">
          {/* 주제 */}
          <div>
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
          <div>
            <label htmlFor="plan-time">시간 설정</label>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={startHM}
                onChange={(e) => setStartHM(e.target.value)}
                aria-invalid={timeInvalid}
                className={tw(
                  'w-36 rounded-md border px-3 py-2',
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
                  'w-36 rounded-md border px-3 py-2',
                  timeInvalid
                    ? 'border-error-500 bg-error-500/10 focus:outline-none'
                    : 'border-neutral-700 bg-background-white focus:outline-none focus:border-secondary-400'
                )}
                step={60}
              />
              {timeInvalid && (
                <p role="alert" aria-live="polite" className="my-2 text-xs text-error-500">
                  끝나는 시간은 시작 시간보다 앞설 수 없습니다.
                </p>
              )}
            </div>

            {/* 반복 설정 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
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
              {frequency === 'WEEKLY' && <WeekdayChips value={byDay} onChange={setByDay} />}
            </div>
            {/* 색상 */}
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
        <div className="flex justify-end gap-2">
          <Button borderType="outline" color="secondary" size="md" onClick={onClose}>
            취소
          </Button>
          <Button
            borderType="solid"
            color="primary"
            size="md"
            disabled={disabled}
            onClick={handleSubmit}
          >
            등록
          </Button>
        </div>
      </div>
    </div>
  );
}
export default CreatePlanModal;
