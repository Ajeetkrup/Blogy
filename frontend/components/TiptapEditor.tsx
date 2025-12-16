'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import YouTube from '@tiptap/extension-youtube'
import { useEffect, useRef } from 'react'
import EditorToolbar from './EditorToolbar'

interface TiptapEditorProps {
    content: any
    onChange: (content: any) => void
    editable?: boolean
    showToolbar?: boolean
    onEditorReady?: (editor: any) => void
    placeholder?: string
}

const TiptapEditor = ({ content, onChange, editable = true, showToolbar = true, onEditorReady, placeholder = 'Tell your story...' }: TiptapEditorProps) => {
    const editorRef = useRef<any>(null)
    
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Placeholder.configure({
                placeholder: placeholder,
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-500 underline cursor-pointer hover:text-blue-700',
                },
            }),
            Image.configure({
                inline: true,
                allowBase64: true,
                HTMLAttributes: {
                    class: 'max-w-full h-auto rounded-lg my-4',
                },
            }),
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            YouTube.configure({
                width: 640,
                height: 480,
                HTMLAttributes: {
                    class: 'rounded-lg my-4',
                },
            }),
        ],
        content: content,
        editable: editable,
        onUpdate: ({ editor }) => {
            onChange(editor.getJSON())
        },
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'prose prose-lg sm:prose-xl lg:prose-2xl mx-auto focus:outline-none min-h-[60vh] max-w-3xl font-serif text-gray-800 leading-relaxed placeholder:text-gray-300 px-4 py-6',
            },
            handlePaste: (view, event) => {
                const clipboardData = event.clipboardData
                if (!clipboardData) return false

                const items = Array.from(clipboardData.items)
                const imageItem = items.find(item => item.type.startsWith('image/'))

                if (imageItem) {
                    event.preventDefault()
                    const file = imageItem.getAsFile()
                    if (file) {
                        const reader = new FileReader()
                        reader.onload = (e) => {
                            const dataUrl = e.target?.result as string
                            editorRef.current?.chain().focus().setImage({ src: dataUrl }).run()
                        }
                        reader.readAsDataURL(file)
                    }
                    return true
                }

                const pastedText = clipboardData.getData('text/plain')
                if (pastedText) {
                    const trimmedText = pastedText.trim()
                    
                    const imageUrlPattern = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i
                    const youtubePattern = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
                    const vimeoPattern = /vimeo\.com\/(\d+)/
                    const videoPattern = /\.(mp4|webm|ogg|mov)(\?.*)?$/i

                    if (imageUrlPattern.test(trimmedText)) {
                        event.preventDefault()
                        editorRef.current?.chain().focus().setImage({ src: trimmedText }).run()
                        return true
                    }

                    if (youtubePattern.test(trimmedText)) {
                        event.preventDefault()
                        const match = trimmedText.match(youtubePattern)
                        if (match) {
                            const videoId = match[1]
                            editorRef.current?.chain().focus().setYoutubeVideo({
                                src: `https://www.youtube.com/embed/${videoId}`,
                                width: 640,
                                height: 480,
                            }).run()
                        }
                        return true
                    }

                    if (vimeoPattern.test(trimmedText)) {
                        event.preventDefault()
                        const match = trimmedText.match(vimeoPattern)
                        if (match) {
                            const videoId = match[1]
                            const iframeHtml = `<iframe src="https://player.vimeo.com/video/${videoId}" width="640" height="480" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" class="rounded-lg my-4" style="max-width: 100%;"></iframe>`
                            editorRef.current?.chain().focus().insertContent(iframeHtml).run()
                        }
                        return true
                    }

                    if (videoPattern.test(trimmedText)) {
                        event.preventDefault()
                        const videoHtml = `<video src="${trimmedText}" controls class="rounded-lg my-4 max-w-full" style="max-width: 100%;"></video>`
                        editorRef.current?.chain().focus().insertContent(videoHtml).run()
                        return true
                    }
                }

                return false
            },
        },
    })

    useEffect(() => {
        editorRef.current = editor
        if (editor && onEditorReady) {
            onEditorReady(editor)
        }
    }, [editor, onEditorReady])

    useEffect(() => {
        if (editor && content) {
            const currentContent = editor.getJSON()
            const contentStr = JSON.stringify(currentContent)
            const newContentStr = JSON.stringify(content)
            
            if (contentStr !== newContentStr) {
                editor.commands.setContent(content, { emitUpdate: false })
            }
        }
    }, [content, editor])

    if (!editor) {
        return null
    }

    return (
        <div className="w-full relative bg-white">
            {editable && showToolbar && <EditorToolbar editor={editor} />}
            <div className="overflow-auto">
                <EditorContent editor={editor} />
            </div>
        </div>
    )
}

export default TiptapEditor
