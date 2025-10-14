import StarterKit from '@tiptap/starter-kit';
import { Link as TiptapLink } from '@tiptap/extension-link';
import { Underline as TiptapUnderline } from '@tiptap/extension-underline';
import { Image as TiptapImage } from '@tiptap/extension-image';
import { TextAlign as TiptapAlign } from '@tiptap/extension-text-align';

export const CustomImage = TiptapImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      // 서버에서 받은 attachmentId를 저장할 커스텀 속성
      attachmentId: {
        default: null,
        // 에디터의 JSON/데이터를 HTML로 렌더링할 때 'data-id' 속성으로 추가
        renderHTML: (attributes) => {
          if (!attributes.attachmentId) {
            return {};
          }
          return {
            'data-id': attributes.attachmentId,
          };
        },
        // HTML을 파싱하여 에디터 JSON으로 변환할 때 'data-id' 속성 값을 읽어 attachmentId로 저장
        parseHTML: (element) => element.getAttribute('data-id'),
      },
    };
  },
});

export const TIPTAP_EXTENSIONS = [
  StarterKit.configure({
    heading: { levels: [2, 3, 4] },
    blockquote: false,
    codeBlock: false,
    horizontalRule: false,
  }),
  TiptapUnderline,
  TiptapLink.configure({
    openOnClick: true,
    autolink: false,
    protocols: ['http', 'https', 'mailto'],
    HTMLAttributes: {
      target: '_blank',
      rel: 'noopener noreferrer',
    },
  }),
  CustomImage.configure({ allowBase64: true }),
  TiptapAlign.configure({
    types: ['heading', 'paragraph'],
    alignments: ['left', 'center', 'right'],
  }),
];
