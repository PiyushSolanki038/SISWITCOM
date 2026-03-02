import React, { forwardRef, useImperativeHandle } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';

export type RichTemplateEditorHandle = {
  bold: () => void;
  italic: () => void;
  underline: () => void;
  heading1: () => void;
  paragraph: () => void;
  bulletList: () => void;
  orderedList: () => void;
  link: (href: string) => void;
  removeFormat: () => void;
  insertCTA: () => void;
  insertDivider: () => void;
  undo: () => void;
  redo: () => void;
};

type Props = {
  value: string;
  onChange: (nextHtml: string) => void;
  minHeight?: number;
};

const RichTemplateEditor = forwardRef<RichTemplateEditorHandle, Props>(({ value, onChange, minHeight = 640 }, ref) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Type your email content...' }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none',
        style: `min-height:${minHeight}px;`,
      },
    },
  });

  useImperativeHandle(ref, () => ({
    bold: () => editor?.chain().focus().toggleBold().run(),
    italic: () => editor?.chain().focus().toggleItalic().run(),
    underline: () => editor?.chain().focus().toggleUnderline().run(),
    heading1: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
    paragraph: () => editor?.chain().focus().setParagraph().run(),
    bulletList: () => editor?.chain().focus().toggleBulletList().run(),
    orderedList: () => editor?.chain().focus().toggleOrderedList().run(),
    link: (href: string) => editor?.chain().focus().setLink({ href }).run(),
    removeFormat: () => editor?.chain().focus().unsetAllMarks().clearNodes().run(),
    insertCTA: () => {
      const cta =
        '<a href="{{cta_url}}" style="background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;display:inline-block;font-weight:600;">Call To Action</a>';
      editor?.chain().focus().insertContent(cta).run();
    },
    insertDivider: () => {
      const hr = '<hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0" />';
      editor?.chain().focus().insertContent(hr).run();
    },
    undo: () => editor?.commands.undo(),
    redo: () => editor?.commands.redo(),
  }));

  return (
    <div className="border rounded bg-white">
      <EditorContent editor={editor} />
      <div className="border-t p-4">
        <div className="text-xs text-slate-500">Rendered Preview</div>
        <div className="mt-2 border rounded p-4" dangerouslySetInnerHTML={{ __html: value || '' }} />
      </div>
    </div>
  );
});

export default RichTemplateEditor;
