export type FrequencyEnum = 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type ColorEnum = 'RED' | 'ORANGE' | 'YELLOW' | 'GREEN' | 'BLUE' | 'PURPLE' | 'PINK';
export type DayOfWeekEnum = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
export type ApplyScope = 'THIS_ONLY' | 'FROM_THIS_DATE';

/** POST /api/plans 요청 */
export type RepeatRuleRequest = {
  frequency: FrequencyEnum;
  intervalValue: 1; // repeat = 1로 고정
  byDay?: DayOfWeekEnum[];
  untilDate?: string | null;
};

export type CreatePlanRequestBody = {
  subject: string;
  startDate: string;
  endDate: string;
  color: ColorEnum;
  repeatRule?: RepeatRuleRequest | null; // 반복되지 않는 일정이면 null
};

/** GET /api/plans/date/{date} 응답 */
export type RawDayPlan = {
  id: number;
  subject: string;
  startDate: string;
  endDate: string;
  color: ColorEnum;
  repeatRule?: RepeatRuleRequest | null;
};

export type PlannerRawEnvelop = {
  code: string;
  message: string;
  data: {
    date: string;
    plans: RawDayPlan[];
    totalCount: number;
  };
  success: boolean;
};

/** PUT /api/plans/{planId} 요청 */
export type UpdatePlanPayload = {
  id: number;
  payload: CreatePlanRequestBody;
  applyScope?: ApplyScope;
};

/** DELETE /api/plans/{planId} 요청 */
export type DeletePlanPayload = {
  id: number;
  selectedDate: string;
  applyScope: ApplyScope;
};
