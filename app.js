/* ============================================================
   P03 · 待办清单 Pro
   里程碑 4：筛选（全部/未完成/已完成）+ 剩余计数
   ------------------------------------------------------------
   ⭐ 这一版最大的变化：
      以前 —— 列表只有一种看法（全部）
      现在 —— 账本不变，换一份「子清单」重画：筛的是画法，不是数据
   ============================================================ */

const form  = document.querySelector('.add-form');
const input = document.querySelector('#todo-input');
const list  = document.querySelector('#todo-list');
const empty = document.querySelector('#empty');
const filters = document.querySelector('.filters');
const count   = document.querySelector('#count');

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

        li.innerHTML =
            '<input type="checkbox" class="todo-check"' + (todo.done ? ' checked' : '') + '>' +
            '<span class="todo-text"></span>' +
            '<button type="button" class="todo-del">×</button>';

        li.querySelector('.todo-text').textContent = todo.text;

        /* 在标签上贴号码，但记的必须是「账本里的位置」 */
        li.dataset.index = todos.indexOf(todo);

        list.appendChild(li);
    });

    updateEmpty();
    updateCount();
}

/* 剩余计数：不存数字，每次照账本现算 */
function updateCount() {
    const remaining = todos.filter(function (todo) {
        return !todo.done;
    }).length;

    count.textContent = remaining;
}

function updateEmpty() {
    empty.style.display = todos.length === 0 ? '' : 'none';
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
   ⑦ 启动
   ============================================================ */
load();
render();
