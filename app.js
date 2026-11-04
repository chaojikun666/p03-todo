/* ============================================================
   P03 · 待办清单 Pro
   里程碑 6：双击编辑
   ------------------------------------------------------------
   ⭐ 这一版最大的变化：
      以前 —— 想改一句话，只能删了重加
      现在 —— 双击临时借个输入框，改完还是写回账本
   ============================================================ */

const form  = document.querySelector('.add-form');
const input = document.querySelector('#todo-input');
const list  = document.querySelector('#todo-list');
const empty = document.querySelector('#empty');
const filters = document.querySelector('.filters');
const count   = document.querySelector('#count');
const themeBtn = document.querySelector('#theme-btn');

/* ============================================================
   ① 数据 —— 真正的「账本」
   每一项长这样：{ text: '买牛奶', done: false }
   ============================================================ */
let todos = [];
let currentFilter = 'all';   // 当前在看哪一档：all / active / done

/* ============================================================
   ② 读：页面打开时，先把上次存的读出来
   ============================================================ */
function load() {
    const raw = localStorage.getItem('todos');
    if (raw) {
        todos = JSON.parse(raw);   // 文字 → 数组
    }
}


/* ============================================================
   ③ 存：每次改完数据，立刻写回浏览器
   ============================================================ */
function save() {
    localStorage.setItem('todos', JSON.stringify(todos));   // 数组 → 文字
}


/* ============================================================
   ④ 画：照「账本」把整个列表重画一遍
   ------------------------------------------------------------
   每次都全部清空、全部重贴。
   看起来笨，但永远不会漏、不会错位。
   ============================================================ */
function render() {
    list.innerHTML = '';           // 先把墙上的便利贴全撕掉

    // 先按当前档位挑出要显示的条目（筛子：返回 true 的留下）
    const visible = todos.filter(function (todo) {
        if (currentFilter === 'active') return !todo.done;
        if (currentFilter === 'done')   return todo.done;
        return true;                     // 'all'：全部留下
    });

    visible.forEach(function (todo) {
        const li = document.createElement('li');
        li.className = 'todo-item' + (todo.done ? ' done' : '');
        li.draggable = true;                       // 这一行变成"可以用鼠标抓起来"

        li.innerHTML =
            '<input type="checkbox" class="todo-check"' + (todo.done ? ' checked' : '') + '>' +
            '<span class="todo-text"></span>' +
            '<button type="button" class="todo-del">×</button>';

        li.querySelector('.todo-text').textContent = todo.text;

        /* 在标签上贴号码，但记的必须是「账本里的位置」 */
        li.dataset.index = todos.indexOf(todo);

        list.appendChild(li);
    });

    updateEmpty(visible.length);
    updateCount();
}

/* 剩余计数：不存数字，每次照账本现算 */
function updateCount() {
    const remaining = todos.filter(function (todo) {
        return !todo.done;
    }).length;

    count.textContent = remaining;
}

/* 空状态：什么时候显示、显示什么话，要看情况说 */
function updateEmpty(visibleCount) {
    if (todos.length === 0) {
        empty.textContent = '还没有待办，加一条试试';
    } else if (visibleCount === 0) {
        empty.textContent = currentFilter === 'done'
            ? '还没有已完成的任务，去勾一个吧'
            : '未完成的任务都清空了，厉害';
    } else {
        empty.style.display = 'none';   // 有内容，藏起来
        return;
    }

    empty.style.display = '';           // 该显示的时候露出来
}


/* ============================================================
   ⑤ 添加：改数据 → 存 → 重画
   ============================================================ */
form.addEventListener('submit', function (event) {
    event.preventDefault();

    const text = input.value.trim();
    if (text === '') return;

    todos.push({ text: text, done: false });   // 1. 改数据
    save();                                    // 2. 存进浏览器
    render();                                  // 3. 重画页面

    input.value = '';
    input.focus();
});


/* ============================================================
   ⑥ 勾选 / 删除：同样先改数据，再重画
   ============================================================ */
list.addEventListener('click', function (event) {
    const target = event.target;
    const li = target.closest('.todo-item');
    if (!li) return;

    /* 读出这条任务在数组里的位置 */
    const index = Number(li.dataset.index);

    /* ---------- 删除 ---------- */
    if (target.classList.contains('todo-del')) {
        todos.splice(index, 1);    // 从数组里挖掉这一条
        save();
        render();
        return;
    }

    /* ---------- 勾选 ---------- */
    if (target.classList.contains('todo-check')) {
        todos[index].done = !todos[index].done;   // 翻转 true / false
        save();
        render();
    }
});

/* ============================================================
   ⑧ 筛选：点按钮 → 改档位 → 重画
   ============================================================ */
filters.addEventListener('click', function (event) {
    const btn = event.target.closest('.filter-btn');
    if (!btn) return;

    currentFilter = btn.dataset.filter;   // 记住用户点了哪一档

    /* 按钮高亮：先全部熄灯，再点亮点中的那个 */
    document.querySelectorAll('.filter-btn').forEach(function (b) {
        b.classList.remove('active');
        if (b === btn) b.classList.add('active');
    });

    render();   // 档位变了，重画
});
/* ============================================================
   ⑨ 拖拽排序：抓起来 → 拖到目标那一行 → 松手
   ------------------------------------------------------------
   注意：拖完不是搬 DOM 节点，而是改账本 → 存 → 重画。
   ============================================================ */
let dragIndex = null;   // 正在拖的那一条，在账本里的编号

/* ① 抓起：记住抓的是哪一条，并把它变淡 */
list.addEventListener('dragstart', function (event) {
    const li = event.target.closest('.todo-item');
    if (!li) return;

    dragIndex = Number(li.dataset.index);
    li.classList.add('dragging');

    /* 给浏览器塞个占位数据，某些浏览器没有它就不肯拖 */
    if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', String(dragIndex));
    }
});

/* ② 拖到某一行上面：必须拦下默认行为，否则浏览器不认为这里"可以放" */
list.addEventListener('dragover', function (event) {
    if (!event.target.closest('.todo-item')) return;
    event.preventDefault();
});

/* ③ 松手：把它挪到目标那一行的位置 */
list.addEventListener('drop', function (event) {
    event.preventDefault();

    const li = event.target.closest('.todo-item');
    if (!li || dragIndex === null) return;

    const targetIndex = Number(li.dataset.index);
    if (targetIndex === dragIndex) {
        dragIndex = null;
        return;
    }

    const moved = todos.splice(dragIndex, 1)[0];   // 先从账本里挖出来
    todos.splice(targetIndex, 0, moved);           // 再插到目标那一格

    dragIndex = null;
    save();
    render();
});

/* ④ 拖完了（不管成没成功）：清场，把"变淡"样式去掉 */
list.addEventListener('dragend', function () {
    dragIndex = null;
    document.querySelectorAll('.dragging').forEach(function (el) {
        el.classList.remove('dragging');
    });
});

/* ============================================================
   ⑩ 双击编辑：文字临时借一个输入框用一用
   ------------------------------------------------------------
   注意：输入框是"临时道具"，不是新的数据。
        改完还是写回账本 → 存 → 重画，输入框就消失了。
   ============================================================ */
list.addEventListener('dblclick', function (event) {
    const textEl = event.target.closest('.todo-text');
    if (!textEl) return;

    const li = textEl.closest('.todo-item');
    const index = Number(li.dataset.index);

    /* ① 造一个输入框，放进原来文字的位置 */
    const input = document.createElement('input');
    input.className = 'todo-edit';
    input.value = todos[index].text;

    textEl.replaceWith(input);   // 用输入框换掉那行文字
    input.focus();               // 光标直接在里面
    input.select();              // 顺便全选，方便直接覆盖

    li.draggable = false;        // 编辑时先别让整行被拖走，否则选不中字

    /* ② 收尾只允许发生一次（回车和失焦可能都触发） */
    let finished = false;

    function finish(commit) {
        if (finished) return;
        finished = true;

        const value = input.value.trim();

        if (commit && value !== '') {
            todos[index].text = value;
            save();
        }

        render();   // 无论存不存，都照账本重画：输入框自然消失
    }

    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter')  finish(true);    // 回车 = 存
        if (e.key === 'Escape') finish(false);   // Esc  = 不改
    });

    input.addEventListener('blur', function () {
        finish(true);                            // 点到别处 = 存
    });
});

/* ============================================================
   ⑪ 主题：换一套 CSS 变量，不是换一套 CSS
   ============================================================ */
function applyTheme(theme) {
    document.body.dataset.theme = theme;   // 在 body 上贴标记，CSS 自己会换颜色
    themeBtn.textContent = theme === 'dark' ? '☀️ 浅色' : '🌙 深色';
}

themeBtn.addEventListener('click', function () {
    const next = document.body.dataset.theme === 'dark' ? 'light' : 'dark';

    applyTheme(next);
    localStorage.setItem('theme', next);   // 记住选择，下次打开还是这个
});

/* ============================================================
   ⑦ 启动
   ============================================================ */
load();
applyTheme(localStorage.getItem('theme') || 'light');
render();
