/**
 * HtmlEditor
 */
class HtmlEditor {

    // エディター
    editor = null;
    // エディターメニュー
    editor_menu = null;
    // エディター編集エリア
    editor_content = null;

    // 最後のイベント
    lastevent = null;

    // rangeInfo
    rangeInfo = {
        startNode: null,
        startOffset: null,
        endNode: null,
        endOffset: null,
    };

    data_editor_menu = [
        { event: 'bold', text: '太字' },
        { event: 'underline', text: '下線' },
        { event: 'italic', text: '斜体' },
        { event: 'strike', text: '取り消し線' },
    ];

    /**
     * constracutor
     */
    constructor(params) {
        this.initialize(params);
    }

    /**
     * initialize
     */
    initialize(params) {


        this.editor = params.element;
        this.height = params.height;

        // エディター要素設定
        this.editor.classList.add('html-editor');

        // メニュー
        /*
        const el_menu = document.createElement('div');
        el_menu.classList.add('html-editor-menu');

        const el_menu_list = document.createElement('ul');

        for (let i = 0; i < this.data_editor_menu.length; i++) {
            const li = document.createElement('li');
            const button = document.createElement('button');
            button.setAttribute('data-event', this.data_editor_menu[i].event);
            button.innerText = this.data_editor_menu[i].text;
            li.appendChild(button);

            el_menu_list.appendChild(li);
        }
        el_menu.appendChild(el_menu_list);

        this.editor.appendChild(el_menu);

        this.editor_menu = el_menu;
        */

        // 編集エリアのHTMLを作成
        const el_content = document.createElement('div');
        el_content.classList.add('html-editor-content');
        this.editor.appendChild(el_content);

        this.editor_content = el_content;
        this.editor_content.setAttribute('contenteditable', true);

        // this.editor.addEventListener("click", modifyText, false);

        this.editor.addEventListener('keydown', this.eventKeydown.bind(this));


        // 初期値を設定する
        this.editor_content.style.height = this.height + 'px';

    }

    /**
     * keydown
     * @param {KeyboardEvent} event
     */
    eventKeydown = function (event) {

        let self = this;

        console.log('html editor:event keydown');
        console.log('event key=' + event.key);

        if (event.key === 'Enter') {
            console.log('enter');
        }

        // 太字(Ctrl + B)
        if (event.ctrlKey && event.key === 'b') {
            event.preventDefault();
            this.toggleTag(document.createElement("b"));
        }
        // 下線(Ctrl + U)
        if (event.ctrlKey && event.key === 'u') {
            event.preventDefault();
            this.toggleTag(document.createElement("u"));
        }
        // 斜体(Ctrl + I)
        if (event.ctrlKey && event.key === 'i') {
            event.preventDefault();
            this.toggleTag(document.createElement("i"));
        }
        // 取り消し線(Shift + Alt + D)
        if (event.shiftKey && event.altKey && event.key.toLowerCase() === 'd') {
            event.preventDefault();
            this.toggleTag(document.createElement("s"));
        }

        self.updateContents();
    }

    /**
     * toggleTag
     * @param tag
     */
    toggleTag = function (tag) {

        const self = this;

        let selection = window.getSelection();

        if (selection.rangeCount == 0) {
            return;
        }

        // 選択範囲
        let range = selection.getRangeAt(0);

        // console.log(range.startContainer);
        // console.log(range.startContainer.nodeType);
        // console.log(range.endContainer);
        // console.log(range.endContainer.nodeType);

        // 開始・終了地点を含むノード
        let ancestor = range.commonAncestorContainer;

        // // エディター内でなければ終了する
        // if (ancestor.parentNode &&
        //     (
        //         !ancestor.parentNode.classList.contains('html-editor-content')
        //         || !ancestor.parentNode.closest('.html-editor-content')
        //     )
        // ) return;

        // トグル処理の判定
        const isUnwrap = self.checkUnwrap(selection, ancestor, tag);
        console.log("isUnwrap:" + isUnwrap);

        // 処理の種類を判定したい
        // ・行タグをまたぐか
        // ・単体のノードか
        // ・複数のノードか
        /*
        const contents = range.cloneContents();
        let isSingleNode = false;
        let isCrossLines = false;
        if (contents.querySelector('p')) isCrossLines = true;
        */

        // 選択範囲のオフセットを取得
        let checkOffset = 0;
        let checkStartNode = null;
        let checkStartOffset = 0;
        let checkEndNode = null;
        let checkEndOffset = 0;

        const checkRangeOffset = function (contents) {
            let node = contents.firstChild;
            while (node) {
                switch (node.nodeType) {
                    case Node.ELEMENT_NODE:
                        checkRangeOffset(node);
                        break;
                    case Node.TEXT_NODE:
                        if (node.isSameNode(range.startContainer)) {
                            checkStartNode = node;
                            checkStartOffset = checkOffset + range.startOffset;
                        }
                        if (node.isSameNode(range.endContainer)) {
                            checkEndNode = node;
                            checkEndOffset = checkOffset + range.endOffset;
                        }
                        checkOffset += node.length;
                        break;
                }
                node = node.nextSibling;
            }
        }
        checkRangeOffset(this.editor_content);
        console.log("checkOffset:" + checkOffset);
        console.log("checkStartOffset:" + checkStartOffset);
        console.log("checkEndOffset:" + checkEndOffset);

        // // Rangeの位置を保存する
        // this.rangeInfo.startNode = range.startContainer;
        // this.rangeInfo.startOffset = range.startOffset;
        // this.rangeInfo.endNode = range.endContainer;
        // this.rangeInfo.endOffset = range.endOffset;

        // クリーニング
        this.cleaningTag(selection, ancestor, tag);

        if (isUnwrap) {
            console.log("選択範囲のタグを取り除く");
            // 選択範囲のタグを取り除く
            this.trimTag(selection, ancestor, tag);
        } else {
            console.log("選択範囲に含まれるノード全体を処理する");
            // 選択範囲に含まれるノード全体を処理する
            this.wrappTag(selection, ancestor, tag);
        }

        // クリーニング
        this.cleaningTag(selection, ancestor, tag);

        // オフセットから選択範囲を復元する
        const restoreRangeInfo = function (contents, startOffset, endOffset) {
            const nodeList = self.getNodeList(contents, [Node.TEXT_NODE]);
            let textOffset = 0;
            for (let i = 0; i < nodeList.length; i++) {
                let node = nodeList[i];
                // console.log(node);
                // console.log("textOffset:" + textOffset);
                // console.log("nodeLength:" + node.length);
                // console.log("maxLength:" + (textOffset + node.length));
                // 開始地点を決定
                if ((textOffset <= startOffset) && (startOffset <= textOffset + node.length)) {
                    console.log("udpate start")
                    self.rangeInfo.startNode = node;
                    self.rangeInfo.startOffset = startOffset - textOffset;
                }
                // 終了地点を決定
                if ((textOffset <= endOffset) && (endOffset <= textOffset + node.length)) {
                    console.log("udpate end")
                    self.rangeInfo.endNode = node;
                    self.rangeInfo.endOffset = endOffset - textOffset;

                    break;
                }
                textOffset += node.length;
            }
        }
        restoreRangeInfo(this.editor_content, checkStartOffset, checkEndOffset);
        console.log("-----")
        console.log(self.rangeInfo)

        // Rangeの位置を復元する
        selection.removeAllRanges();
        const newRange = document.createRange();
        newRange.setStart(
            this.rangeInfo.startNode,
            this.rangeInfo.startOffset
        );
        newRange.setEnd(
            this.rangeInfo.endNode,
            this.rangeInfo.endOffset
        )
        selection.addRange(newRange);

    }

    /**
     * タグ削除の判定
     * @param {Selection} selection
     * @param {Node} node
     * @param {Element} tag
     */
    checkUnwrap = function (selection, node, tag) {

        const targetNodeType = tag.nodeType;
        const targetTagName = tag.tagName.toLowerCase();

        if (node.nodeType == Node.TEXT_NODE) {
            // 親要素が同じタグならtrue
            if (node.parentElement) {
                if (targetTagName == node.parentElement.tagName.toLowerCase()) {
                    return true;
                }
            }
        } else {
            // 対象のタグならtrue
            if (targetTagName == node.tagName.toLowerCase()) {
                return true;
            }

            // 選択範囲の全ての子ノードが対象のタグならtrue
            const range = selection.getRangeAt(0);
            const contents = range.cloneContents();
            console.log(contents);
            // ★選択範囲に含まれている
            // ★
            if (contents.childNodes) {
                let childs = contents.childNodes;
                let count = 0;
                for (let i = 0; i < childs.length; i++) {
                    const child = contents.childNodes[i];
                    if (child.nodeType == Node.TEXT_NODE) {
                        if (child.textContent == '') {
                            count++;
                        }
                    }
                    if (child.nodeType == Node.ELEMENT_NODE) {
                        if (targetTagName == child.tagName.toLowerCase()) {
                            count++;
                        }
                    }
                }
                if (count == childs.length) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * 選択範囲のタグを囲う
     */
    wrappTag = function (selection, node, tag) {

        const self = this;

        let range = selection.getRangeAt(0);

        let nodeList = [];

        // ノード一覧を取得する
        const getNodeList = function (contents) {
            let node = contents.firstChild;
            while (node) {
                switch (node.nodeType) {
                    case Node.ELEMENT_NODE:
                        // 同じタグでなければノード一覧に追加する
                        if (node.tagName.toLowerCase() != tag.tagName.toLowerCase()) {
                            getNodeList(node);
                        }
                        break;
                    case Node.TEXT_NODE:
                        nodeList.push(node);
                        break;
                }
                node = node.nextSibling;
            }
        }
        getNodeList(node);

        // 単体のテキストノードを処理
        if (node.nodeType == Node.TEXT_NODE) {
            this.surroundTagTextNode(selection, range, node, tag);
        }
        // 複数のテキストノードを処理
        if (nodeList.length > 0) {
            for (let i = 0; i < nodeList.length; i++) {
                let child = nodeList[i];
                this.surroundTagTextNode(selection, range, child, tag);
            }
        }
    };

    /**
     * surroundTagTextNode
     */
    surroundTagTextNode = function (selection, range, node, tag) {

        if (node.nodeType != Node.TEXT_NODE) return;

        // 選択範囲の始点を含むノード
        const startNode = range.startContainer;
        // 選択範囲の始点の位置
        const startOffset = range.startOffset;
        // 選択範囲の終点を含むノード
        const endNode = range.endContainer;
        // 選択範囲の終点の位置
        const endOffset = range.endOffset;

        // ノードが選択範囲に含まれなければ処理しない
        if (selection.containsNode(node, false) == false) {
            return;
        }

        // console.log(startNode.cloneNode());
        // console.log(startOffset);
        // console.log(endNode.cloneNode());
        // console.log(endOffset);

        let text = node.textContent;

        let posStart = 0;
        let posEnd = text.length;

        let textBefore = "";
        let textCenter = "";
        let textAfter = "";

        let newBefore = null;
        let newContent = null;
        let newAfter = null;

        const isStartNode = node.isSameNode(startNode);
        const isEndNode = node.isSameNode(endNode);

        // 開始ノードと終了ノードが同じ場合
        if (isStartNode && isEndNode) {
            console.log("開始ノードと終了ノードが同じ場合");
            posStart = startOffset;
            posEnd = endOffset;
        }
        // 開始ノードの場合
        else if (isStartNode) {
            console.log("開始タグの場合");
            posStart = startOffset;
            posEnd = text.length;
        }
        // 終了ノードの場合
        else if (isEndNode) {
            console.log("終了タグの場合");
            posStart = 0;
            posEnd = endOffset;
        }

        // 文字列を処理する
        if (posStart > 0) {
            textBefore = text.slice(0, posStart);
            newBefore = document.createTextNode(textBefore);
        }

        textCenter = text.slice(posStart, posEnd);
        newContent = tag.cloneNode();
        newContent.textContent = textCenter;

        if (posEnd < text.length) {
            textAfter = text.slice(posEnd);
            newAfter = document.createTextNode(textAfter);
        }

        // fragmentに格納
        let fragment = document.createDocumentFragment();
        if (textBefore) fragment.appendChild(newBefore);
        if (textCenter) fragment.appendChild(newContent);
        if (textAfter) fragment.appendChild(newAfter);

        // Rangeの情報を更新
        if (isStartNode && !isEndNode) {
            console.log(newContent);
            this.rangeInfo.startNode = newContent;
            this.rangeInfo.startOffset = 0;
        }
        if (!isStartNode && isEndNode) {
            this.rangeInfo.endNode = newContent;
            this.rangeInfo.endOffset = newContent.childNodes.length;
        }

        // ノードの置き換えを実行
        this.replaceDocumentFragment(node, fragment);
    }

    /**
     * 選択範囲のタグを除去
     * @param {Selection} selection
     * @param {Node} node
     * @param {Element} tag
     */
    trimTag = function (selection, node, tag) {

        let range = selection.getRangeAt(0);

        let nodeList = [];

        // ノード一覧を取得する
        const getNodeList = function (contents) {
            let node = contents.firstChild;
            while (node) {
                if (node.nodeType == Node.ELEMENT_NODE) {
                    nodeList.push(node);
                    getNodeList(node);
                }
                node = node.nextSibling;
            }
        }
        getNodeList(node);

        // 単体のテキストノードを処理
        if (node.nodeType == Node.TEXT_NODE) {
            if (node.parentElement) {
                this.elementRepaceTag(selection, range, node.parentElement, tag);
            }
        }

        // 複数のノードを処理
        if (nodeList.length > 0) {
            for (let i = 0; i < nodeList.length; i++) {
                let node = nodeList[i];
                this.elementRepaceTag(selection, range, node, tag);
            }
        }
    }

    /**
     * ノードの配列を取得する
     * @param {*} contents
     * @param {Array} type
     * @returns
     */
    getNodeList = function (contents, types) {

        let nodeList = [];

        const recursive = function (contents) {

            let node = contents.firstChild;

            while (node) {

                const nodeType = node.nodeType;
                if (types.includes(nodeType)) {
                    nodeList.push(node);
                }

                if (nodeType == Node.ELEMENT_NODE) {
                    recursive(node);
                }

                node = node.nextSibling;
            }
        }

        recursive(contents);

        return nodeList;
    }

    /**
     * Elementのタグを除去
     * @param {Element} element
     */
    elementUnwrap = function (element) {
        while (element.firstChild) {
            element.parentNode.insertBefore(element.firstChild, element);
        }
        element.remove();
    };

    /**
     * 隣接するElementを結合する
     * @param {Node} node
     * @param {Element} tag
     */
    elementJoin = function (node, tag) {

        if (node.nodeType != Node.ELEMENT_NODE) return;

        const tagName = tag.tagName.toLowerCase();

        while (node) {

            const current = node;
            const next = node.nextSibling;

            if (!next) break;
            if (next.nodeType != Node.ELEMENT_NODE) break;
            if (current.tagName.toLowerCase() == tagName
                && next.tagName.toLowerCase() == tagName
            ) {
                const newElement = document.createElement(tagName);
                while (current.firstChild) {
                    newElement.appendChild(current.firstChild);
                }
                while (next.firstChild) {
                    newElement.appendChild(next.firstChild);
                }
                newElement.normalize();
                current.parentNode.insertBefore(newElement, current);
                current.remove();
                next.remove();
            }
            node = node.nextSibling;
        }
    }

    /**
     * 対象ノードをDocumentFragmentで置換する
     * @param {Node} node
     * @param {DocumentFragment} fragment
     */
    replaceDocumentFragment = function (node, fragment) {
        while (fragment.firstChild) {
            node.parentNode.insertBefore(fragment.firstChild, node);
        }
        node.remove();
    };

    /**
     * Elementの選択範囲のタグを除去する
     * @param {Selection} selection
     * @param {Range} range
     * @param {Node} node
     * @param {Element} tag
     */
    elementRepaceTag = function (selection, range, node, tag) {

        if (node.nodeType != Node.ELEMENT_NODE) return;

        // 選択範囲の始点を含むノード
        const startNode = range.startContainer.parentElement;
        // 選択範囲の始点の位置
        const startOffset = range.startOffset;
        // 選択範囲の終点を含むノード
        const endNode = range.endContainer.parentElement;
        // 選択範囲の終点の位置
        const endOffset = range.endOffset;

        // ノードが選択範囲に含まれなければ処理しない
        if (selection.containsNode(node, true) == false) {
            return;
        }

        let text = node.textContent;

        let posStart = 0;
        let posEnd = text.length;

        let textBefore = "";
        let textCenter = "";
        let textAfter = "";

        let newBefore = null;
        let newContent = null;
        let newAfter = null;

        const isStartNode = node.isSameNode(startNode);
        const isEndNode = node.isSameNode(endNode);

        // 開始ノードと終了ノードが同じ場合
        if (isStartNode && isEndNode) {
            console.log("開始ノードと終了ノードが同じ場合");
            posStart = startOffset;
            posEnd = endOffset;
        }
        // 開始ノードの場合
        else if (isStartNode) {
            console.log("開始タグの場合");
            posStart = startOffset;
            posEnd = text.length;
        }
        // 終了ノードの場合
        else if (isEndNode) {
            console.log("終了タグの場合");
            posStart = 0;
            posEnd = endOffset;
        }

        // 文字列を処理する
        textBefore = text.slice(0, posStart);
        textCenter = text.slice(posStart, posEnd);
        textAfter = text.slice(posEnd);
        if (textBefore) {
            newBefore = tag.cloneNode();
            newBefore.textContent = textBefore;
        }
        if (textCenter) {
            newContent = document.createTextNode(textCenter);
        }
        if (textAfter) {
            newAfter = tag.cloneNode();
            newAfter.textContent = textAfter;
        }

        // fragmentに格納
        let fragment = document.createDocumentFragment();
        if (newBefore) fragment.appendChild(newBefore);
        if (newContent) fragment.appendChild(newContent);
        if (newAfter) fragment.appendChild(newAfter);

        // ノードの置き換えを実行
        this.replaceDocumentFragment(node, fragment);
    }

    /**
     * ElementのHTMLからタグを削除
     * @param {Element} element
     * @param {Element} tag
     */
    elementHtmlRemoveTag = function (element, tag) {
        const tagName = tag.tagName.toLowerCase();
        const reg = new RegExp(`<\/*${tagName}.*?>`, "ig");
        element.innerHTML = element.innerHTML.replace(reg, '');
    }

    /**
     * クリーニング
     * ・重複するタグを削除する
     * ・隣接するタグを連結する
     * @param {Selection} selection
     * @param {Node} contents
     * @param {Element} tag
     */
    cleaningTag(selection, contents, tag) {

        if (contents.nodeType != Node.ELEMENT_NODE) return;

        const self = this;

        const tagName = tag.tagName.toLowerCase();

        const recursive = function (contents) {
            let node = contents.firstChild;
            while (node) {
                if (node.nodeType == Node.ELEMENT_NODE) {
                    // 1.重複するタグを削除する
                    if (node.tagName.toLowerCase() == tagName) {
                        self.elementHtmlRemoveTag(node, tag);
                    }
                    // 2.隣接するタグを連結する
                    self.elementJoin(node, tag);
                    recursive(node);
                }
                node = node.nextSibling;
            }
        }
        recursive(contents);

        // テキストノードを結合
        contents.normalize();
    }

    // /**
    //  * イベント:onEnter
    //  */
    // onEnter = function (e) {
    //     console.log('Summernote:onEnter():start');
    //     if (!this.check_event_continue('onEnter')) {
    //         return false;
    // }

    // }

    /**
     * イベント:onPaste
     */
    onPaste = function (e) {
        console.log('Summernote:onPaste():start');
        if (!this.check_event_continue('onPaste')) {
            return false;
        }
        // プレーンテキストで貼り付ける
        var bufferText = ((e.originalEvent || e).clipboardData || window.clipboardData).getData('Text');
        console.log(bufferText);
        e.preventDefault();
        document.execCommand('insertText', false, bufferText);
    }

    /**
     * 行タグで囲う
     */
    rowtag = function () {
        let current = this.caretElement();
        console.log(current);
        return current;
    }

    // /**
    //  * キャレットがデザイン部品にあるか
    //  */
    // caretInContent = function () {
    //     const ret = false;
    //     if (this.selection.anchorNode) {
    //         const current = this.selection.anchorNode;
    //         // デザイン部品を編集中の場合はtrueを返す
    //         if (current.classList.contains('cms-content-editable')
    //             || current.closest('.cms-content-editable')) {
    //             console.log("デザイン部品を編集中です");
    //             ret = true;
    //         }
    //         // 見出しの場合は除外する
    //         if (current.classList.contains('cms-heading')
    //             || current.closest('.cms-heading')) {
    //             console.log("見出しを編集中です");
    //             ret = false;
    //         }
    //     }
    //     return ret;
    // }

    /**
     * キャレット位置の要素を取得する
     */
    caretElement = function () {

        const selection = document.getSelection();
        let current = null;
        if (selection.anchorNode) {
            let node = selection.anchorNode;
            current = node.closest('.html-editor > *');
        }
        return current;
    }

    /**
     * キャレット位置を取得する
     */
    caretOffset = function (element) {
        var caretOffset = 0;
        var doc = element.ownerDocument || element.document;
        var win = doc.defaultView || doc.parentWindow;
        var sel;
        if (typeof win.getSelection != "undefined") {
            sel = win.getSelection();
            if (sel.rangeCount > 0) {
                var range = win.getSelection().getRangeAt(0);
                var preCaretRange = range.cloneRange();
                preCaretRange.selectNodeContents(element);
                preCaretRange.setEnd(range.endContainer, range.endOffset);
                caretOffset = preCaretRange.toString().length;
            }
        } else if ((sel = doc.selection) && sel.type != "Control") {
            var textRange = sel.createRange();
            var preCaretTextRange = doc.body.createTextRange();
            preCaretTextRange.moveToElementText(element);
            preCaretTextRange.setEndPoint("EndToEnd", textRange);
            caretOffset = preCaretTextRange.text.length;
        }
        return caretOffset;
    }

    /**
     * 同じイベントの連続実行を判定する
     */
    /*
    checkEventContinue = function (event) {
        if (this.lastevent !== event) {
            this.lastevent = event;
            return true;
        } else {
            console.log(event + 'イベントが連続して実行されました')
            return false;
        }
    }
    */

    /**
     * HTMLを取得する
     */
    getContents = function () {
        return this.editor_content.innerHTML;
    }

    /**
     * HTMLを設定する
     * @param {String} html
     */
    setContents = function (html) {
        this.editor_content.innerHTML = html;
    }

    /**
     * HTMLの更新
     */
    updateContents = function () {

        // エディターが空ならpタグを挿入する
        if (this.editor.innerHTML === '') {
            this.editor.innerHTML = '<p><br/></p>';
        }
    }
}