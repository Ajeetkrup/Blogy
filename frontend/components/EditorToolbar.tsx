'use client'

import { Editor } from '@tiptap/react'
import { useState } from 'react'

interface EditorToolbarProps {
    editor: Editor | null
}

const EditorToolbar = ({ editor }: EditorToolbarProps) => {
    const [showLinkInput, setShowLinkInput] = useState(false)
    const [linkUrl, setLinkUrl] = useState('')
    const [showImageInput, setShowImageInput] = useState(false)
    const [imageUrl, setImageUrl] = useState('')

    if (!editor) {
        return null
    }

    // Helper function to safely check if editor can perform an action
    const canPerformAction = (action: () => boolean) => {
        try {
            return editor.view && action()
        } catch {
            return false
        }
    }

    // Helper function to safely check if editor is active
    const isActive = (name: string, options?: any) => {
        try {
            return editor.view && editor.isActive(name, options)
        } catch {
            return false
        }
    }

    const handleLinkSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (linkUrl) {
            try {
                editor.chain().focus().setLink({ href: linkUrl }).run()
                setLinkUrl('')
                setShowLinkInput(false)
            } catch (e) {
                console.error('Error setting link:', e)
            }
        }
    }

    const handleImageSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (imageUrl) {
            try {
                editor.chain().focus().setImage({ src: imageUrl }).run()
                setImageUrl('')
                setShowImageInput(false)
            } catch (e) {
                console.error('Error setting image:', e)
            }
        }
    }

    const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onload = (event) => {
                try {
                    const dataUrl = event.target?.result as string
                    editor.chain().focus().setImage({ src: dataUrl }).run()
                } catch (e) {
                    console.error('Error setting image from file:', e)
                }
            }
            reader.readAsDataURL(file)
        }
        e.target.value = ''
    }

    const Separator = () => <div className="w-px h-5 bg-gray-300 mx-1" />

    return (
        <div className="border-b border-gray-200 bg-white">
            <div className="flex items-center gap-1 px-4 py-2">
                <button
                    onClick={() => {
                        try {
                            editor.chain().focus().toggleBold().run()
                        } catch (e) {
                            console.error('Error toggling bold:', e)
                        }
                    }}
                    disabled={!canPerformAction(() => editor.can().chain().focus().toggleBold().run())}
                    className={`px-2 py-1 text-sm font-medium transition-colors rounded ${
                        isActive('bold') 
                            ? 'bg-gray-200 text-gray-900' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    title="Bold"
                >
                    B
                </button>

                <button
                    onClick={() => {
                        try {
                            editor.chain().focus().toggleItalic().run()
                        } catch (e) {
                            console.error('Error toggling italic:', e)
                        }
                    }}
                    disabled={!canPerformAction(() => editor.can().chain().focus().toggleItalic().run())}
                    className={`px-2 py-1 text-sm font-medium transition-colors rounded ${
                        isActive('italic') 
                            ? 'bg-gray-200 text-gray-900' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    title="Italic"
                >
                    I
                </button>

                <button
                    onClick={() => {
                        try {
                            editor.chain().focus().toggleUnderline().run()
                        } catch (e) {
                            console.error('Error toggling underline:', e)
                        }
                    }}
                    disabled={!canPerformAction(() => editor.can().chain().focus().toggleUnderline().run())}
                    className={`px-2 py-1 text-sm font-medium transition-colors rounded ${
                        isActive('underline') 
                            ? 'bg-gray-200 text-gray-900' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    title="Underline"
                >
                    U
                </button>

                <Separator />

                <button
                    onClick={() => {
                        try {
                            editor.chain().focus().toggleHeading({ level: 1 }).run()
                        } catch (e) {
                            console.error('Error toggling heading 1:', e)
                        }
                    }}
                    className={`px-2 py-1 text-sm font-medium transition-colors rounded ${
                        isActive('heading', { level: 1 }) 
                            ? 'bg-gray-200 text-gray-900' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    title="Heading 1"
                >
                    H1
                </button>

                <button
                    onClick={() => {
                        try {
                            editor.chain().focus().toggleHeading({ level: 2 }).run()
                        } catch (e) {
                            console.error('Error toggling heading 2:', e)
                        }
                    }}
                    className={`px-2 py-1 text-sm font-medium transition-colors rounded ${
                        isActive('heading', { level: 2 }) 
                            ? 'bg-gray-200 text-gray-900' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    title="Heading 2"
                >
                    H2
                </button>

                <Separator />

                <button
                    onClick={() => {
                        try {
                            editor.chain().focus().toggleBulletList().run()
                        } catch (e) {
                            console.error('Error toggling bullet list:', e)
                        }
                    }}
                    className={`px-2 py-1 transition-colors rounded ${
                        isActive('bulletList') 
                            ? 'bg-gray-200 text-gray-900' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    title="Bullet List"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                <button
                    onClick={() => {
                        try {
                            editor.chain().focus().toggleOrderedList().run()
                        } catch (e) {
                            console.error('Error toggling ordered list:', e)
                        }
                    }}
                    className={`px-2 py-1 transition-colors rounded ${
                        isActive('orderedList') 
                            ? 'bg-gray-200 text-gray-900' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    title="Numbered List"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                </button>

                <Separator />

                <button
                    onClick={() => {
                        try {
                            editor.chain().focus().toggleBlockquote().run()
                        } catch (e) {
                            console.error('Error toggling blockquote:', e)
                        }
                    }}
                    className={`px-2 py-1 transition-colors rounded ${
                        isActive('blockquote') 
                            ? 'bg-gray-200 text-gray-900' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    title="Quote"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </button>

                <button
                    onClick={() => {
                        try {
                            editor.chain().focus().toggleCodeBlock().run()
                        } catch (e) {
                            console.error('Error toggling code block:', e)
                        }
                    }}
                    className={`px-2 py-1 transition-colors rounded ${
                        isActive('codeBlock') 
                            ? 'bg-gray-200 text-gray-900' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    title="Code Block"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                </button>

                <div className="flex-1" />

                <div className="relative">
                    <button
                        onClick={() => {
                            try {
                                if (isActive('link')) {
                                    editor.chain().focus().unsetLink().run()
                                } else {
                                    setShowLinkInput(!showLinkInput)
                                    if (showLinkInput) setLinkUrl('')
                                }
                            } catch (e) {
                                console.error('Error handling link:', e)
                            }
                        }}
                        className={`px-2 py-1 transition-colors rounded ${
                            isActive('link') 
                                ? 'bg-gray-200 text-gray-900' 
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                        title="Link"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                    </button>
                    {showLinkInput && (
                        <form onSubmit={handleLinkSubmit} className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg p-2 z-20">
                            <input
                                type="text"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                placeholder="Enter URL"
                                className="px-2 py-1 border border-gray-300 rounded text-sm w-48"
                                autoFocus
                            />
                            <div className="flex gap-1 mt-2">
                                <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                                    Add
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowLinkInput(false)
                                        setLinkUrl('')
                                    }}
                                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                <div className="relative">
                    <button
                        onClick={() => {
                            setShowImageInput(!showImageInput)
                            if (showImageInput) setImageUrl('')
                        }}
                        className="px-2 py-1 transition-colors text-gray-600 hover:text-gray-900"
                        title="Image"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </button>
                    {showImageInput && (
                        <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg p-2 z-20">
                            <form onSubmit={handleImageSubmit} className="mb-2">
                                <input
                                    type="text"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    placeholder="Image URL"
                                    className="px-2 py-1 border border-gray-300 rounded text-sm w-48 mb-2"
                                    autoFocus
                                />
                                <div className="flex gap-1">
                                    <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                                        Add
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowImageInput(false)
                                            setImageUrl('')
                                        }}
                                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                            <label className="block">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageFile}
                                    className="hidden"
                                />
                                <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 cursor-pointer inline-block">
                                    Upload Image
                                </span>
                            </label>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default EditorToolbar
