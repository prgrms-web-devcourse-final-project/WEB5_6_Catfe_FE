// Day.js 공통 설정

import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import updateLocale from 'dayjs/plugin/updateLocale';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localizedFormat);
dayjs.extend(updateLocale);
dayjs.locale('ko');
dayjs.tz.setDefault('Asia/Seoul');
dayjs.updateLocale('ko', { weekStart: 1 }); // 월요일 시작

export default dayjs;
