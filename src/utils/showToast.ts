import { Flip, toast } from 'react-toastify';

type toastType = 'success' | 'warn' | 'error' | 'info';

export default function showToast(type: toastType, msg: string) {
  switch (type) {
    case 'success': {
      toast.success(msg, {
        transition: Flip,
      });
      break;
    }
    case 'warn': {
      toast.warn(msg, {
        transition: Flip,
      });
      break;
    }
    case 'error': {
      toast.error(msg, {
        transition: Flip,
      });
      break;
    }
    case 'info': {
      toast.info(msg, {
        transition: Flip,
      });
      break;
    }
  }
}
