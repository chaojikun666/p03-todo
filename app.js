/* ============================================================
   P03 · 待办清单 Pro
   里程碑 3：存到 localStorage，刷新不丢
   ------------------------------------------------------------
   ⭐ 这一版最大的变化：
      以前 —— 用户点了，直接改页面
      现在 —— 用户点了，先改「数据」，再照数据把页面重画一遍
   ============================================================ */

const form  = document.querySelector('.add-form');
const input = document.querySelector('#todo-input');
const list  = document.querySelector('#todo-list');
const empty = document.querySelector('#empty');


/* ============================================================
   ① 数据 —— 真正的「账本」
   每一项长这样：{ text: '买牛奶', done: false }
   ============================================================ */
let todos = [];


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

    todos.forEach(function (todo, index) {
        const li = document.createElement('li');
        li.className = 'todo-item' + (todo.done ? ' done' : '');

        li.innerHTML =
            '<input type="checkbox" class="todo-check"' + (todo.done ? ' checked' : '') + '>' +
            '<span class="todo-text"></span>' +
            '<button type="button" class="todo-del">×</button>';

        li.querySelector('.todo-text').textContent = todo.text;

        /* 在标签上贴一个号码，记着自己是第几条 */
        li.dataset.index = index;

        list.appendChild(li);
    });

    updateEmpty();
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
   ⑦ 启动
   ============================================================ */
load();
render();
