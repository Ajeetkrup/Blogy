try {
    const tiptapReact = require('@tiptap/react');
    console.log('Keys in @tiptap/react:', Object.keys(tiptapReact));
    console.log('BubbleMenu exported?', !!tiptapReact.BubbleMenu);

    try {
        const menus = require('@tiptap/react/menus');
        console.log('Keys in @tiptap/react/menus:', Object.keys(menus));
    } catch (e) {
        console.log('@tiptap/react/menus not found');
    }
} catch (e) {
    console.error('Error requiring @tiptap/react:', e.message);
}
