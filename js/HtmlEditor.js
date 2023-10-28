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


    // // エディターの入力
    // editor_input = null;
    // // エディターの値
    // editor_value = null;

    // // エディターID
    // editor_id = '';
    // // 機能ID
    // function_id = '';
    // // 機能種別
    // function_type = '';
    // // CSSクラス
    // css_class = '';
    // // エディターの高さ
    // height = 500;
    // // ステータス
    // status = '';

    // // パーツリスト
    // editor_list_parts = [];
    // // 装飾リスト
    // editor_list_style = [];
    // // アイコンリスト
    // editor_list_icon = [];
    // // リンクの一覧
    // editor_list_link = [];
    // // 吹き出しの一覧
    // editor_list_balloon = [];

    // // 色リスト
    // editor_list_color = [
    //     //{'name':'ライト',           'color':'light'},
    //     //{'name':'ダーク',           'color':'dark'},
    //     { 'name': 'レッド', 'color': 'red' },
    //     { 'name': 'ピンク', 'color': 'pink' },
    //     { 'name': 'パープル', 'color': 'purple' },
    //     //{'name':'ディープパープル', 'color':'deeppurple'},
    //     { 'name': 'インディゴ', 'color': 'indigo' },
    //     { 'name': 'ブルー', 'color': 'blue' },
    //     //{'name':'ライトブルー',     'color':'lightblue'},
    //     { 'name': 'シアン', 'color': 'cyan' },
    //     { 'name': 'ティール', 'color': 'teal' },
    //     { 'name': 'グリーン', 'color': 'green' },
    //     //{'name':'ライトグリーン',   'color':'lightgreen'},
    //     { 'name': 'ライム', 'color': 'lime' },
    //     { 'name': 'イエロー', 'color': 'yellow' },
    //     { 'name': 'アンバー', 'color': 'amber' },
    //     { 'name': 'オレンジ', 'color': 'orange' },
    //     //{'name':'ディープオレンジ', 'color':'deeporange'},
    //     { 'name': 'ブラウン', 'color': 'brown' },
    //     { 'name': 'グレー', 'color': 'grey' },
    //     { 'name': 'ブルーグレー', 'color': 'bluegrey' }
    // ];

    // 最後のイベント
    lastevent = null;

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
     * 初期化処理
     */
    initialize(params) {


        this.editor = params.element;
        this.height = params.height;

        // エディター要素設定
        this.editor.classList.add('html-editor');

        // メニュー
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
        console.log('event key='+event.key);

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

        // // デザイン部品のHTML設定
        // if (this.caretInContent()) {
        //     //self.editor_input.summernote("pasteHTML", "<br>&#xFEFF;");
        //     event.preventDefault();
        // }
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
        let toggle = false;
        if (ancestor.parentElement) {
            const currentTag = ancestor.parentElement.tagName.toLowerCase();
            const targetTag = tag.tagName.toLowerCase();
            if (currentTag === targetTag) {
                toggle = true;
            }
        }

        //console.log(range.cloneContents());

        // 処理の種類を判定したい
        // ・行タグをまたぐか
        // ・単体のノードか
        // ・複数のノードか
        const contents = range.cloneContents();
        let isSingleNode = false;
        let isCrossLines = false;
        if (contents.querySelector('p')) isCrossLines = true;

        // Rangeの位置を保存する
        this.rangeInfo.startNode = range.startContainer;
        this.rangeInfo.startOffset = range.startOffset;
        this.rangeInfo.endNode = range.endContainer;
        this.rangeInfo.endOffset = range.endOffset;

        // クリーニング
        this.cleaningTag(selection, ancestor, tag);

        // トグル処理を実行
        if (toggle) {
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
     * 選択範囲のタグを囲う
     */
    wrappTag = function (selection, node, tag) {

        const self = this;

        //exclude || (exclude = ['script', 'style', 'iframe', 'canvas']);

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

        // // 選択範囲の始点を含むノード
        // const startNode = range.startContainer;
        // // 選択範囲の始点の位置
        // const startOffset = range.startOffset;
        // // 選択範囲の終点を含むノード
        // const endNode = range.endContainer;
        // // 選択範囲の終点の位置
        // const endOffset = range.endOffset;

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
        if (newBefore) fragment.appendChild(newBefore);
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
     * 選択範囲のタグを取り除く
     * @param {Selection} selection
     * @param {Node} node
     * @param {Element} tag
     */
    trimTag = function (selection, node, tag) {

        let range = selection.getRangeAt(0);

        const nodeList = this.getNodeElement(node);

        // 選択範囲の始点を含むノード
        const startNode = range.startContainer;
        // 選択範囲の始点の位置
        const startOffset = range.startOffset;
        // 選択範囲の終点を含むノード
        const endNode = range.endContainer;
        // 選択範囲の終点の位置
        const endOffset = range.endOffset;

        // 単体のテキストノードを処理
        if (node.nodeType == Node.TEXT_NODE) {
            if (node.parentElement) {
                const fragment = this.elementRepaceTag(node.parentElement, tag, startOffset, endOffset);
                this.replaceDocumentFragment(node.parentElement, fragment);
            }
        }

        // 1つの要素のみを処理する
        if (nodeList.length > 0) {

            for (let i = 0; i < nodeList.length; i++) {

                let child = nodeList[i];

                /*
                let isSameTag = false;
                if (child.tagName.toLowerCase() === tag.tagName.toLowerCase()) {
                    isSameTag = true;
                }
                // 選択範囲がタグの内側にある場合
                if (isSameTag && child.isSameNode(startNode) && child.isSameNode(endNode)) {

                }
                // 同じタグの場合
                if (isSameTag) {
                    this.unwrap(child);
                }
                */
            }
        }
    }

    /**
     * Textノードを取得する
     */
    getNodeText = function (node) {

        let list = [];

        const find = function (node) {
            let child = node.firstChild;
            while (child) {
                switch (child.nodeType) {
                    case Node.ELEMENT_NODE:
                        find(child);
                        break;
                    case Node.TEXT_NODE:
                        list.push(child);
                        break;
                }

                child = child.nextSibling;
            }
        }

        find(node);

        return list;
    }

    /**
     * Elementノードを取得する
     */
    getNodeElement = function (node) {

        let list = [];

        const find = function (node) {
            let child = node.firstChild;
            while (child) {
                switch (child.nodeType) {
                    case Node.ELEMENT_NODE:
                        list.push(child);
                        find(child);
                        break;
                }
                child = child.nextSibling;
            }
        }

        find(node);

        return list;
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
     * 隣接するElementを結合
     * @param {Node} node
     * @param {Element} tag
     */
    elementJoin = function (node, tag) {

        if (node.nodeType != Node.ELEMENT_NODE) return;

        const tagName = tag.tagName.toLowerCase();

        while (node) {
            if (!node.nextSibling) break;
            const next = node.nextSibling;
            if (next.nodeType != Node.ELEMENT_NODE) break;

            // 隣接する同じタグを結合する
            if (node.tagName.toLowerCase() == tagName
                && next.tagName.toLowerCase() == tagName
            ) {
                const newElement = document.createElement(tagName);
                newElement.innerHTML = node.innerHTML + next.innerHTML;
                node.parentNode.insertBefore(newElement, node);
                node.remove();
                next.remove();
            }
            node = node.nextSibling;
        }
    }

    /**
     * 対象ノードをDocumentFragmentで置換
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
     * @param {HTMLElement} element
     * @returns
     */
    elementRepaceTag = function (element, tag, posStart, posEnd) {

        if (element.nodeType !== Node.ELEMENT_NODE) return;

        /*
        // 選択範囲がタグと等しい場合
        if (posStart == 0 && posEnd == node.textContent.length) {
        }
        // 選択範囲がタグの内側にある場合
        if (posStart >= 0 || posEnd <= node.textContent.length) {
        }
        */

        let text = element.textContent;
        let fragment = document.createDocumentFragment();
        let tagName = element.tagName.toLowerCase();

        let textBefore = "";
        let textMain = "";
        let textAfter = "";

        if (posStart > 0) textBefore = text.slice(0, posStart);
        textMain = text.slice(posStart, posEnd);
        if (posEnd < text.length) textAfter = text.slice(posEnd);

        let newBefore = null;
        let newContent = null;
        let newAfter = null;

        if (textBefore) {
            newBefore = document.createElement(tagName);
            newBefore.textContent = textBefore;
            fragment.appendChild(newBefore);
        }

        if (textMain) {
            newContent = document.createTextNode(textMain);
            fragment.appendChild(newContent);
        }

        if (textAfter) {
            newAfter = document.createElement(tagName);
            newAfter.textContent = textAfter;
            fragment.appendChild(newAfter);
        }

        return fragment;
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
    //     }

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
    getContents = function(){
    }

    /**
     * HTMLを設定する
     */
    setContents = function(){
    }

    /**
     * HTMLの更新
     */
    updateContents = function () {

        // エディターが空ならpタグを挿入する
        if (this.editor.innerHTML === '') {
            this.editor.innerHTML = '<p><br/></p>';
        }

        /*
                // 1.保存用HTML
                let html = jQuery('<div>');
                html.append(jQuery(this.editor_input.summernote('code')).clone(true));

                // 2.編集領域
                let $editable = this.editor.find('.cms-html-content');

                // 編集可能な要素のCSSクラス
                //--------------------------------------------
                this.editor.find('.cms-html-content > [class^=cms-box]').addClass('cms-content-editable');
                this.editor.find('.cms-html-content > [class^=cms-heading]').addClass('cms-content-editable');
                this.editor.find('.cms-html-content [class^=cms-link]').addClass('cms-content-editable');
                this.editor.find('.cms-html-content > [class^=cms-balloon]').addClass('cms-content-editable');
                this.editor.find('.cms-html-content > [class^=cms-blogcard]').addClass('cms-content-editable');
                this.editor.find('.cms-html-content > [class^=cms-image]').addClass('cms-content-editable');
                this.editor.find('.cms-html-content > [class^=cms-parts]').addClass('cms-content-editable');
                this.editor.find('.cms-html-content > [class^=cms-faq]').addClass('cms-content-editable');
                this.editor.find('.cms-html-content > [class^=cms-table]').addClass('cms-content-editable');

                // 編集可能な要素の空チェック
                //--------------------------------------------
                if (!this.editor.find('.cms-html-content > [class^=cms-box]').text()) {
                    this.editor.find('.cms-html-content > [class^=cms-box]').html("&#xFEFF;")
                }
                if (!this.editor.find('.cms-html-content > [class^=cms-balloon] .cms-balloon-content').text()) {
                    this.editor.find('.cms-html-content > [class^=cms-balloon] .cms-balloon-content').html("&#xFEFF;")
                }

                // HTMLのクリーンアップ
                //--------------------------------------------

                // 保存用HTMLからエディターのHTMLを除去する
                // ※DB保存用のHTMLにのみ処理を行う
                html.find('.cms-content-editable').each(function (index, element) {
                    $(element).removeClass('cms-content-editable');
                    $(element).removeAttr('contenteditable');
                });
                html.find('.cms-link-notitle').removeClass('cms-link-notitle');
                for (let $i = 0; $i < this.popover_class_list.length; $i++) {
                    html.find(this.popover_class_list[$i]).remove();
                }
        
                // テキストのクリーンアップ
                //--------------------------------------------
                this.cleanText(html);
                this.cleanText($editable);
        
                // 画像タグのクリーンアップ
                //--------------------------------------------
                this.cleanImage(html);
                this.cleanImage($editable);
        
                // リンクタグのクリーンアップ
                //--------------------------------------------
                this.cleanLink(html);
                this.cleanLink($editable);
        
                // テーブルタグのクリーンアップ
                //--------------------------------------------
                this.cleanTable(html);
                this.cleanTable($editable);
        
                // 文字数カウント
                //--------------------------------------------
                this.editor.find('.note-status-output').html(
                    '文字数：' + html.text().length
                );
        
                // HTMLを保存する
                //--------------------------------------------
                let save_html = html.html();
        
                // テキスト内のゼロ幅非表示文字を削除する
                save_html = save_html.replace(/[\u200B-\u200D\uFEFF]/g, '');
        
                // URIエンコード
                save_html = encodeURIComponent(save_html);
        
                // エディターのhidden値を更新する
                this.editor_value.find('input').val(save_html);
        */
    }


    // /**
    //  * テキストのクリーンアップ
    //  */
    // cleanText = function (contents) {

    //     // letter-spacingを除去する
    //     contents.find('span,b').each(function (index, element) {
    //         $(element).css('letter-spacing', '');
    //     });

    //     // 空のスタイルを除去する
    //     contents.find('[style=""]').removeAttr('style');
    //     // 空のクラスを除去する
    //     contents.find('[class=""]').removeAttr('class');

    //     // エディタ直下の<br>タグは除去する
    //     contents.children("br").each(function (index, element) {
    //         $(element).remove();
    //     });

    //     // 空の<p>タグを除去する
    //     contents.find("p").each(function (index, element) {
    //         // <p>タグ内が空文字、かつタグが含まれていない場合のみ<p>タグを削除する
    //         // ※tirmでは空白文字（半角スペース、タブ）・改行文字（LF、CR）が取り除かれる
    //         if (!$(element).text().trim() && $(element).find('*').length == 0) {
    //             $(element).remove();
    //         }
    //     });
    //     // 属性が1つもない<span>タグは除去する
    //     contents.find("span").each(function (index, element) {
    //         if ($(element).get(0).attributes.length == 0) {
    //             $(element).contents().unwrap();
    //         }
    //     });
    //     // 見出し
    //     contents.find("h1,h2,h3,h4,h5,h6").each(function (index, element) {
    //         let tagname = $(element).prop("tagName").toLowerCase();
    //         // 見出しのCSSクラスが無ければ追加
    //         if (!$(element).hasClass('cms-heading')) {
    //             $(element).addClass('cms-heading');
    //         }
    //         // hタグのCSSクラスが無ければ追加
    //         if (!$(element).hasClass('cms-heading-' + tagname)) {
    //             $(element).addClass('cms-heading-' + tagname);
    //         }
    //         // toc-display属性が無ければ追加
    //         if (!$(element).attr('data-toc-display')) {
    //             $(element).attr('data-toc-display', 'on');
    //         }
    //     });
    // }

    // /**
    //  * 画像タグのクリーンアップ
    //  */
    // cleanImage = function (contents) {
    //     contents.find('img').each(function (index, element) {
    //         var $image = $(element);
    //         var naturalWidth = $image[0].naturalWidth;
    //         var naturalHeight = $image[0].naturalHeight;

    //         // 画像の横幅が取得出来ればwidth属性にセット
    //         if ($image.attr('width') == null && naturalWidth) {
    //             $image.attr('width', naturalWidth);
    //         }
    //         // 画像の縦幅が取得出来ればwidth属性にセット
    //         if ($image.attr('height') == null && naturalHeight) {
    //             $image.attr('height', naturalHeight);
    //         }
    //         // style属性にheight:auto;をセット
    //         if ($image.attr('width') || $image.attr('height')) {
    //             $image.css('height', 'auto');
    //         }
    //         // ▼条件を満たす画像のリカバリ
    //         // ・エディタのHTMLで囲われていない
    //         // ・classが設定されていない
    //         if ($image.closest("[class^='cms-']").length == 0
    //             && typeof $image.attr('class') === "undefined"
    //             && !$image.attr('class')
    //         ) {
    //             // <p>タグで囲われていたら除去する
    //             if ($image.parent('p').length > 0) {
    //                 $image.unwrap('p');
    //             }
    //             // <figure>タグで囲う
    //             $image.wrap('<figure class="cms-image">');
    //         }
    //     });
    //     contents.find('.cms-image').each(function (index, element) {
    //         let $cms_image = $(element);
    //         // <p>タグで囲われていたら除去する
    //         if ($cms_image.parent('p').length > 0) {
    //             $cms_image.unwrap('p');
    //         }
    //     });
    // }

    // /**
    //  * リンクのクリーンアップ
    //  */
    // cleanLink = function (contents) {
    //     let linkList = this.editor_list_link;
    //     contents.find('.cms-link').each(function (index, element) {
    //         // リンク設定
    //         if (linkList && $(element).attr('data-link-id')) {
    //             let linkId = $(element).attr('data-link-id');
    //             let linkData = linkList.find(obj => obj.link_id === linkId);
    //             if (!linkData) {
    //                 // リンク設定が見つからないdata属性を削除する
    //                 $(element).removeAttr('data-link-id');
    //             } else {
    //                 // リンク設定が見つかった場合は上書きする
    //                 $(element).text(linkData.link_text);
    //                 $(element).attr('href', linkData.link_url);
    //             }
    //         }
    //         // リンクに含まれるアイコン関係のCSSクラスを全て削除
    //         $(element).removeClass(function (index, className) {
    //             return (className.match(new RegExp('\\b' + 'cms-icon-' + '\\S+', 'g')) || []).join(' ');
    //         });
    //     });
    // }

    // /**
    //  * テーブルのクリーンアップ
    //  */
    // cleanTable = function (contents) {
    //     contents.find('.cms-table').each(function (index, element) {
    //         let $cms_table = $(element);
    //         // 空のタグにゼロ幅非表示文字を設定
    //         $cms_table.find('th,td').each(function (index, element) {
    //             if ($(element).html() == '') {
    //                 $(element).html('&#xFEFF;');
    //             }
    //         });
    //         // <p>タグで囲われていたら除去する
    //         if ($cms_table.parent('p').length > 0) {
    //             $cms_table.unwrap('p');
    //         }
    //     });
    // }

}