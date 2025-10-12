// Day.js 공통 설정

import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import updateLocale from 'dayjs/plugin/updateLocale';
import utc from 'dayjs/plugin/utc';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(localizedFormat);
dayjs.extend(updateLocale);
dayjs.extend(utc);
dayjs.extend(relativeTime);
dayjs.locale('ko');
dayjs.updateLocale('ko', { weekStart: 1 }); // 월요일 시작

export default dayjs;
