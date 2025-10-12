import {
  ColorEnum,
  CreatePlanRequestBody,
  DayOfWeekEnum,
  FrequencyEnum,
  RepeatRuleRequest,
} from '@/@types/planner';
import { useSelectedDate } from './useSelectedDate';
import dayjs from '@/lib/dayjs';
import { useEffect, useMemo, useState } from 'react';
import { COLOR_ORDER } from '@/lib/plannerSwatch';
import { combineYmdHM, formatWeekday } from '@/lib/datetime';

export interface PlannerFormInitial extends Partial<CreatePlanRequestBody> {
  planId?: number;
  repeatRule?: RepeatRuleRequest | null;
}

export const usePlannerForm = (initial: PlannerFormInitial = {}) => {
  const { date: selectedDate } = useSelectedDate();
  const ymd = dayjs(selectedDate).format('YYYY-MM-DD');

  // 기본 시작 : 선택된 날짜의 현재 시각 정각
  const defaultStart = useMemo(() => {
    const hh = dayjs().hour();
    return dayjs(`${ymd}T${String(hh).padStart(2, '0')}:00:00`).format('YYYY-MM-DDTHH:mm:ss');
  }, [ymd]);

  const [subject, setSubject] = useState(initial?.subject ?? '');
  const [color, setColor] = useState<ColorEnum>(initial?.color ?? COLOR_ORDER[0]);

  // 시간
  const [startHM, setStartHM] = useState<string>(
    initial?.startDate
      ? dayjs(initial.startDate).format('HH:mm')
      : dayjs(defaultStart).format('HH:mm')
  );
  const [endHM, setEndHM] = useState<string>(
    initial?.endDate
      ? dayjs(initial.endDate).format('HH:mm')
      : dayjs(defaultStart).add(1, 'hour').format('HH:mm')
  );

  useEffect(() => {
    if (initial?.startDate) {
      setStartHM(dayjs(initial.startDate).format('HH:mm'));
    }
    if (initial?.endDate) {
      setEndHM(dayjs(initial.endDate).format('HH:mm'));
    }
  }, [initial?.startDate, initial?.endDate]);

  // 계획 반복 설정
  const initFreq: 'NONE' | FrequencyEnum = initial?.repeatRule?.frequency ?? 'NONE';
  const [frequency, setFrequency] = useState<'NONE' | FrequencyEnum>(initFreq);
  const [untilDate, setUntilDate] = useState<string>(initial?.repeatRule?.untilDate ?? '');
  const [byDay, setByDay] = useState<DayOfWeekEnum>(
    initial?.repeatRule?.byDay && initial.repeatRule.byDay.length > 0
      ? initial.repeatRule.byDay[0]
      : formatWeekday(selectedDate)
  );

  const startDate = combineYmdHM(ymd, startHM);
  const endDate = combineYmdHM(ymd, endHM);
  const timeInvalid = !dayjs(endDate).isAfter(startDate);
  const disabled = subject.trim() === '' || timeInvalid;

  const getPayload = (): CreatePlanRequestBody => ({
    subject: subject.trim(),
    startDate,
    endDate,
    color,
    repeatRule:
      frequency === 'NONE'
        ? null
        : {
            frequency,
            intervalValue: 1,
            ...(frequency === 'WEEKLY' ? { byDay: [byDay] } : {}),
            ...(untilDate ? { untilDate: dayjs(untilDate).format('YYYY-MM-DD') } : {}),
          },
  });

  return {
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
  };
};
