#!/usr/bin/env node

/**
 * Lab Autograder — 5-6 React Styling + Fetch Data
 *
 * Grades ONLY based on the TODOs in this lab:
 *  - TODO 1 (Bootstrap layout + spacing + UserList grid + empty state)
 *  - TODO 2 (Fetch users + filter by name)
 *  - TODO 3 (View Details button in UserCard)
 *  - TODO 4 (User details modal in UserModal)
 *
 * Marking:
 * - 80 marks for TODOs (lenient, top-level checks only)
 * - 20 marks for submission timing (deadline-based)
 *   - On/before deadline => 20/20
 *   - After deadline     => 10/20
 *
 * Deadline: 4 Mar 2026 20:59 (Asia/Riyadh, UTC+03:00)
 *
 * Repo layout (per your screenshot):
 * - repo root contains .github/workflows
 * - project folder: 5-6-react-styling-fetch-data/
 * - grader file:   5-6-react-styling-fetch-data/scripts/grade.cjs
 * - student files: 5-6-react-styling-fetch-data/src/...
 *
 * Notes:
 * - Ignores JS/JSX comments (so starter TODO comments do NOT count).
 * - Very lenient checks: looks for key constructs, not exact code.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ARTIFACTS_DIR = "artifacts";
const FEEDBACK_DIR = path.join(ARTIFACTS_DIR, "feedback");
fs.mkdirSync(FEEDBACK_DIR, { recursive: true });

/* -----------------------------
   Deadline (Asia/Riyadh)
   4 Mar 2026, 20:59
-------------------------------- */
const DEADLINE_RIYADH_ISO = "2026-03-04T20:59:00+03:00";
const DEADLINE_MS = Date.parse(DEADLINE_RIYADH_ISO);

// Submission marks policy
const SUBMISSION_MAX = 20;
const SUBMISSION_LATE = 10;

/* -----------------------------
   TODO marks (out of 80)
   (top-level distribution)
-------------------------------- */
const tasks = [
  { id: "t1", name: "TODO 1: Bootstrap layout + spacing + UserList grid + empty state", marks: 20 },
  { id: "t2", name: "TODO 2.1: Fetch users (App.jsx first useEffect)", marks: 20 },
  { id: "t3", name: "TODO 2.2: Filter users by name (App.jsx second useEffect)", marks: 20 },
  { id: "t4", name: 'TODO 3: "View Details" button (UserCard.jsx)', marks: 10 },
  { id: "t5", name: "TODO 4: User details modal (UserModal.jsx)", marks: 10 },
];

const STEPS_MAX = tasks.reduce((sum, t) => sum + t.marks, 0); // 80
const TOTAL_MAX = STEPS_MAX + SUBMISSION_MAX; // 100

/* -----------------------------
   Helpers
-------------------------------- */
function safeRead(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
}

function mdEscape(s) {
  return String(s).replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function splitMarks(stepMarks, missingCount, totalChecks) {
  if (missingCount <= 0) return stepMarks;
  const perItem = stepMarks / totalChecks;
  const deducted = perItem * missingCount;
  return Math.max(0, round2(stepMarks - deducted));
}

/**
 * Strip JS/JSX comments while trying to preserve strings/templates.
 * Not a full parser, but robust enough for beginner labs and avoids
 * counting commented-out code.
 */
function stripJsComments(code) {
  if (!code) return code;

  let out = "";
  let i = 0;

  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;

  while (i < code.length) {
    const ch = code[i];
    const next = code[i + 1];

    // Handle string/template boundaries (with escapes)
    if (!inDouble && !inTemplate && ch === "'" && !inSingle) {
      inSingle = true;
      out += ch;
      i++;
      continue;
    }
    if (inSingle && ch === "'") {
      let backslashes = 0;
      for (let k = i - 1; k >= 0 && code[k] === "\\"; k--) backslashes++;
      if (backslashes % 2 === 0) inSingle = false;
      out += ch;
      i++;
      continue;
    }

    if (!inSingle && !inTemplate && ch === '"' && !inDouble) {
      inDouble = true;
      out += ch;
      i++;
      continue;
    }
    if (inDouble && ch === '"') {
      let backslashes = 0;
      for (let k = i - 1; k >= 0 && code[k] === "\\"; k--) backslashes++;
      if (backslashes % 2 === 0) inDouble = false;
      out += ch;
      i++;
      continue;
    }

    if (!inSingle && !inDouble && ch === "`" && !inTemplate) {
      inTemplate = true;
      out += ch;
      i++;
      continue;
    }
    if (inTemplate && ch === "`") {
      let backslashes = 0;
      for (let k = i - 1; k >= 0 && code[k] === "\\"; k--) backslashes++;
      if (backslashes % 2 === 0) inTemplate = false;
      out += ch;
      i++;
      continue;
    }

    // If not inside a string/template, strip comments
    if (!inSingle && !inDouble && !inTemplate) {
      // line comment
      if (ch === "/" && next === "/") {
        i += 2;
        while (i < code.length && code[i] !== "\n") i++;
        continue;
      }
      // block comment
      if (ch === "/" && next === "*") {
        i += 2;
        while (i < code.length) {
          if (code[i] === "*" && code[i + 1] === "/") {
            i += 2;
            break;
          }
          i++;
        }
        continue;
      }
    }

    out += ch;
    i++;
  }

  return out;
}

function existsFile(p) {
  try {
    return fs.existsSync(p) && fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

function listAllFiles(rootDir) {
  const ignoreDirs = new Set([
    "node_modules",
    ".git",
    ARTIFACTS_DIR,
    "dist",
    "build",
    ".next",
    ".cache",
  ]);

  const stack = [rootDir];
  const out = [];

  while (stack.length) {
    const dir = stack.pop();
    let entries = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (!ignoreDirs.has(e.name)) stack.push(full);
      } else if (e.isFile()) {
        out.push(full);
      }
    }
  }
  return out;
}

/* -----------------------------
   Project root detection (robust)
-------------------------------- */
const REPO_ROOT = process.cwd();

function isViteReactProjectFolder(p) {
  try {
    return (
      fs.existsSync(path.join(p, "package.json")) &&
      fs.existsSync(path.join(p, "src")) &&
      fs.statSync(path.join(p, "src")).isDirectory()
    );
  } catch {
    return false;
  }
}

function pickProjectRoot(cwd) {
  // If action runs inside the project folder already
  if (isViteReactProjectFolder(cwd)) return cwd;

  // Prefer the known lab folder name from this lab
  const preferred = path.join(cwd, "5-6-react-styling-fetch-data");
  if (isViteReactProjectFolder(preferred)) return preferred;

  // Otherwise pick any subfolder that looks like a Vite React project
  let subs = [];
  try {
    subs = fs
      .readdirSync(cwd, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  } catch {
    subs = [];
  }

  for (const name of subs) {
    const p = path.join(cwd, name);
    if (isViteReactProjectFolder(p)) return p;
  }

  // fallback
  return cwd;
}

const PROJECT_ROOT = pickProjectRoot(REPO_ROOT);

/* -----------------------------
   Find files (preferred locations)
-------------------------------- */
function findFileByBasename(names) {
  const preferred = names
    .flatMap((n) => [
      path.join(PROJECT_ROOT, "src", n),
      path.join(PROJECT_ROOT, "src", "components", n),
    ])
    .filter((p) => existsFile(p));

  if (preferred.length) return preferred[0];

  const all = listAllFiles(PROJECT_ROOT);
  const lowerSet = new Set(names.map((x) => x.toLowerCase()));
  const found = all.find((p) => lowerSet.has(path.basename(p).toLowerCase()));
  return found || null;
}

const appFile = findFileByBasename(["App.jsx", "App.js"]);
const searchBarFile = findFileByBasename(["SearchBar.jsx", "SearchBar.js"]);
const userListFile = findFileByBasename(["UserList.jsx", "UserList.js"]);
const userCardFile = findFileByBasename(["UserCard.jsx", "UserCard.js"]);
const userModalFile = findFileByBasename(["UserModal.jsx", "UserModal.js"]);

/* -----------------------------
   Determine submission time
-------------------------------- */
let lastCommitISO = null;
let lastCommitMS = null;

try {
  lastCommitISO = execSync("git log -1 --format=%cI", { encoding: "utf8" }).trim();
  lastCommitMS = Date.parse(lastCommitISO);
} catch {
  lastCommitISO = new Date().toISOString();
  lastCommitMS = Date.now();
}

/* -----------------------------
   Submission marks
-------------------------------- */
const isLate = Number.isFinite(lastCommitMS) ? lastCommitMS > DEADLINE_MS : true;
const submissionScore = isLate ? SUBMISSION_LATE : SUBMISSION_MAX;

/* -----------------------------
   Load & strip student files
-------------------------------- */
const appRaw = appFile ? safeRead(appFile) : null;
const searchRaw = searchBarFile ? safeRead(searchBarFile) : null;
const listRaw = userListFile ? safeRead(userListFile) : null;
const cardRaw = userCardFile ? safeRead(userCardFile) : null;
const modalRaw = userModalFile ? safeRead(userModalFile) : null;

const app = appRaw ? stripJsComments(appRaw) : null;
const searchBar = searchRaw ? stripJsComments(searchRaw) : null;
const userList = listRaw ? stripJsComments(listRaw) : null;
const userCard = cardRaw ? stripJsComments(cardRaw) : null;
const userModal = modalRaw ? stripJsComments(modalRaw) : null;

const results = [];

/* -----------------------------
   Result helpers
-------------------------------- */
function addResult(task, required) {
  const missing = required.filter((r) => !r.ok);
  const score = splitMarks(task.marks, missing.length, required.length);

  results.push({
    id: task.id,
    name: task.name,
    max: task.marks,
    score,
    checklist: required.map((r) => `${r.ok ? "✅" : "❌"} ${r.label}`),
    deductions: missing.length ? missing.map((m) => `Missing: ${m.label}`) : [],
  });
}

function failTask(task, reason) {
  results.push({
    id: task.id,
    name: task.name,
    max: task.marks,
    score: 0,
    checklist: [],
    deductions: [reason],
  });
}

function mkHas(code) {
  return (re) => re.test(code);
}
function anyOf(has, res) {
  return res.some((r) => has(r));
}

/* -----------------------------
   Grade TODOs
-------------------------------- */

/**
 * TODO 1 — App header/footer exact className + SearchBar mb-4 + UserList empty state + grid layout
 */
{
  const missingFiles = [];
  if (!app) missingFiles.push(appFile ? `Unreadable App file: ${appFile}` : "App.jsx not found");
  if (!searchBar) missingFiles.push(searchBarFile ? `Unreadable SearchBar file: ${searchBarFile}` : "SearchBar.jsx not found");
  if (!userList) missingFiles.push(userListFile ? `Unreadable UserList file: ${userListFile}` : "UserList.jsx not found");

  if (missingFiles.length) {
    failTask(tasks[0], missingFiles.join(" | "));
  } else {
    const hasApp = mkHas(app);
    const hasSearch = mkHas(searchBar);
    const hasList = mkHas(userList);

    const required = [
      {
        label: 'App.jsx: <header> className EXACTLY "bg-primary text-white py-3 mb-4 shadow"',
        ok: anyOf(hasApp, [
          /<\s*header\b[^>]*\bclassName\s*=\s*["']bg-primary text-white py-3 mb-4 shadow["'][^>]*>/i,
        ]),
      },
      {
        label: 'App.jsx: <footer> className EXACTLY "bg-light py-4 mt-5"',
        ok: anyOf(hasApp, [
          /<\s*footer\b[^>]*\bclassName\s*=\s*["']bg-light py-4 mt-5["'][^>]*>/i,
        ]),
      },
      {
        label: 'SearchBar.jsx: wrapper <div> className EXACTLY "mb-4"',
        ok: anyOf(hasSearch, [
          /<\s*div\b[^>]*\bclassName\s*=\s*["']mb-4["'][^>]*>/i,
        ]),
      },
      {
        label: 'UserList.jsx: Empty state returns <Alert variant="info"> with exact message',
        ok:
          anyOf(hasList, [/if\s*\(\s*users\.length\s*===\s*0\s*\)\s*\{/i, /if\s*\(\s*!users\.length\s*\)\s*\{/i]) &&
          anyOf(hasList, [
            /return\s*\(\s*<\s*Alert\b[^>]*\bvariant\s*=\s*["']info["'][^>]*>\s*No users found matching your search criteria\.\s*<\s*\/\s*Alert\s*>\s*\)\s*;?/i,
            /return\s*\(\s*<\s*Alert\b[^>]*\bvariant\s*=\s*\{\s*["']info["']\s*\}[^>]*>\s*No users found matching your search criteria\.\s*<\s*\/\s*Alert\s*>\s*\)\s*;?/i,
          ]),
      },
      {
        label: "UserList.jsx: Grid uses <Row> and users.map(...)",
        ok: anyOf(hasList, [/<\s*Row\b/i]) && anyOf(hasList, [/\busers\s*\.\s*map\s*\(/i]),
      },
      {
        label: 'UserList.jsx: Each user renders <Col key={user.id} md={6} lg={4} className="mb-4">',
        ok:
          anyOf(hasList, [/<\s*Col\b/i]) &&
          anyOf(hasList, [
            /\bkey\s*=\s*\{\s*user\.id\s*\}/i,
            /\bkey\s*=\s*\{\s*\w+\.id\s*\}/i,
          ]) &&
          anyOf(hasList, [
            /\bmd\s*=\s*\{\s*6\s*\}/i,
            /\bmd\s*=\s*["']6["']/i,
          ]) &&
          anyOf(hasList, [
            /\blg\s*=\s*\{\s*4\s*\}/i,
            /\blg\s*=\s*["']4["']/i,
          ]) &&
          anyOf(hasList, [
            /\bclassName\s*=\s*["']mb-4["']/i,
          ]),
      },
      {
        label: "UserList.jsx: Inside each <Col>, renders <UserCard user={user} onUserClick={onUserClick} />",
        ok: anyOf(hasList, [
          /<\s*UserCard\b[^>]*\buser\s*=\s*\{\s*user\s*\}[^>]*\bonUserClick\s*=\s*\{\s*onUserClick\s*\}[^>]*\/\s*>/i,
          /<\s*UserCard\b[^>]*\bonUserClick\s*=\s*\{\s*onUserClick\s*\}[^>]*\buser\s*=\s*\{\s*user\s*\}[^>]*\/\s*>/i,
        ]),
      },
    ];

    addResult(tasks[0], required);
  }
}

/**
 * TODO 2.1 — Fetch users in first useEffect (App.jsx)
 */
{
  if (!app) {
    failTask(tasks[1], appFile ? `Could not read App file at: ${appFile}` : "App.jsx not found under src/.");
  } else {
    const has = mkHas(app);

    const required = [
      { label: "Sets loading true at start (setLoading(true))", ok: anyOf(has, [/setLoading\s*\(\s*true\s*\)/i]) },
      { label: "Clears error at start (setError(null))", ok: anyOf(has, [/setError\s*\(\s*null\s*\)/i]) },
      {
        label: 'Fetches from "https://jsonplaceholder.typicode.com/users"',
        ok: anyOf(has, [/fetch\s*\(\s*["']https:\/\/jsonplaceholder\.typicode\.com\/users["']\s*\)/i]),
      },
      { label: "Converts response to JSON (res.json())", ok: anyOf(has, [/\.\s*json\s*\(\s*\)/i]) },
      {
        label: "Stores result into users + filteredUsers (setUsers(data) and setFilteredUsers(data))",
        ok:
          anyOf(has, [/setUsers\s*\(\s*data\s*\)/i]) &&
          anyOf(has, [/setFilteredUsers\s*\(\s*data\s*\)/i]),
      },
      {
        label: "Checks response.ok and throws an Error when not ok (top-level)",
        ok:
          anyOf(has, [/response\.ok/i, /\bres\.ok\b/i]) &&
          anyOf(has, [/throw\s+new\s+Error\s*\(/i]),
      },
      {
        label: "On error sets error message (setError(err.message) or setError(e.message))",
        ok: anyOf(has, [/setError\s*\(\s*(err|error|e)\.message\s*\)/i]),
      },
      { label: "Always finally sets loading false (setLoading(false))", ok: anyOf(has, [/setLoading\s*\(\s*false\s*\)/i]) },
    ];

    addResult(tasks[1], required);
  }
}

/**
 * TODO 2.2 — Filter users by name in second useEffect (App.jsx)
 */
{
  if (!app) {
    failTask(tasks[2], "App.jsx not found / unreadable.");
  } else {
    const has = mkHas(app);

    const required = [
      {
        label: "Second useEffect dependency array is exactly [searchTerm, users]",
        ok: anyOf(has, [
          /useEffect\s*\(\s*\(\s*\)\s*=>[\s\S]*?\}\s*,\s*\[\s*searchTerm\s*,\s*users\s*\]\s*\)/i,
          /useEffect\s*\(\s*\(\s*\)\s*=>[\s\S]*?\}\s*,\s*\[\s*searchTerm\s*,\s*users\s*\]\s*\)\s*;/i,
        ]),
      },
      {
        label: "If searchTerm is empty, sets filteredUsers to full users (setFilteredUsers(users))",
        ok: anyOf(has, [
          /if\s*\(\s*!\s*searchTerm\s*\)\s*\{\s*[^}]*setFilteredUsers\s*\(\s*users\s*\)/i,
          /if\s*\(\s*searchTerm\s*===\s*["']{0}["']\s*\)\s*\{\s*[^}]*setFilteredUsers\s*\(\s*users\s*\)/i,
          /if\s*\(\s*searchTerm\s*==\s*["']{0}["']\s*\)\s*\{\s*[^}]*setFilteredUsers\s*\(\s*users\s*\)/i,
        ]),
      },
      {
        label: "Filters from users (users.filter(...)) not filteredUsers",
        ok: anyOf(has, [/\busers\s*\.\s*filter\s*\(/i]) && !anyOf(has, [/\bfilteredUsers\s*\.\s*filter\s*\(/i]),
      },
      {
        label: "Filter is by name only (user.name...) and case-insensitive includes()",
        ok:
          anyOf(has, [/\bname\b/i]) &&
          anyOf(has, [/toLowerCase\s*\(\s*\)/i]) &&
          anyOf(has, [/includes\s*\(/i]),
      },
      {
        label: "Sets filtered result (setFilteredUsers(filtered) or setFilteredUsers(<filter expr>))",
        ok: anyOf(has, [
          /setFilteredUsers\s*\(\s*filtered\s*\)/i,
          /setFilteredUsers\s*\(\s*users\s*\.\s*filter\s*\(/i,
        ]),
      },
    ];

    addResult(tasks[2], required);
  }
}

/**
 * TODO 3.1 — UserCard: View Details button calls onUserClick(user)
 */
{
  if (!userCard) {
    failTask(
      tasks[3],
      userCardFile ? `Could not read UserCard file at: ${userCardFile}` : "UserCard.jsx not found under src/components."
    );
  } else {
    const has = mkHas(userCard);

    const required = [
      { label: "Renders a Bootstrap <Button>", ok: anyOf(has, [/<\s*Button\b/i]) },
      { label: 'Button text is exactly "View Details"', ok: anyOf(has, [/>[\s\n\r]*View Details[\s\n\r]*<\s*\/\s*Button\s*>/i]) },
      {
        label: "onClick calls onUserClick and passes the current user object",
        ok: anyOf(has, [
          /\bonClick\s*=\s*\{\s*\(\s*\)\s*=>\s*onUserClick\s*\(\s*user\s*\)\s*\}/i,
          /\bonClick\s*=\s*\{\s*\(\s*\)\s*=>\s*onUserClick\s*\(\s*\w+\s*\)\s*\}/i,
          /\bonClick\s*=\s*\{\s*function\s*\(\s*\)\s*\{\s*onUserClick\s*\(\s*user\s*\)\s*;?\s*\}\s*\}/i,
        ]),
      },
    ];

    addResult(tasks[3], required);
  }
}

/**
 * TODO 4 — UserModal: React-Bootstrap modal with correct structure + fields
 */
{
  if (!userModal) {
    failTask(
      tasks[4],
      userModalFile ? `Could not read UserModal file at: ${userModalFile}` : "UserModal.jsx not found under src/components."
    );
  } else {
    const has = mkHas(userModal);

    const required = [
      {
        label: "Renders <Modal> with show={show} and onHide={onHide}",
        ok: anyOf(has, [
          /<\s*Modal\b[^>]*\bshow\s*=\s*\{\s*show\s*\}[^>]*\bonHide\s*=\s*\{\s*onHide\s*\}[^>]*>/i,
          /<\s*Modal\b[^>]*\bonHide\s*=\s*\{\s*onHide\s*\}[^>]*\bshow\s*=\s*\{\s*show\s*\}[^>]*>/i,
        ]),
      },
      {
        label: 'Has title "User Details" inside <Modal.Title>',
        ok: anyOf(has, [
          /<\s*Modal\.Title\b[^>]*>\s*User Details\s*<\s*\/\s*Modal\.Title\s*>/i,
        ]),
      },
      {
        label: "Uses <Modal.Header closeButton>",
        ok: anyOf(has, [/<\s*Modal\.Header\b[^>]*\bcloseButton\b[^>]*>/i]),
      },
      {
        label: "Body shows large avatar using className='user-avatar-large' and user.name.charAt(0)",
        ok: anyOf(has, [
          /className\s*=\s*["']user-avatar-large["'][\s\S]*user\.name\.charAt\s*\(\s*0\s*\)/i,
        ]),
      },
      {
        label: "Body shows Name, Email, Phone, Website each in its own <p>",
        ok:
          anyOf(has, [/<\s*p\b[^>]*>[\s\S]*<\s*strong\s*>\s*Name:\s*<\s*\/\s*strong\s*>/i]) &&
          anyOf(has, [/<\s*p\b[^>]*>[\s\S]*<\s*strong\s*>\s*Email:\s*<\s*\/\s*strong\s*>/i]) &&
          anyOf(has, [/<\s*p\b[^>]*>[\s\S]*<\s*strong\s*>\s*Phone:\s*<\s*\/\s*strong\s*>/i]) &&
          anyOf(has, [/<\s*p\b[^>]*>[\s\S]*<\s*strong\s*>\s*Website:\s*<\s*\/\s*strong\s*>/i]),
      },
      {
        label: "Footer has ONE Close button that triggers onHide",
        ok:
          anyOf(has, [/<\s*Modal\.Footer\b/i]) &&
          anyOf(has, [
            /<\s*Button\b[^>]*\bonClick\s*=\s*\{\s*onHide\s*\}[^>]*>[\s\n\r]*Close[\s\n\r]*<\s*\/\s*Button\s*>/i,
            /<\s*Button\b[^>]*\bonClick\s*=\s*\{\s*\(\s*\)\s*=>\s*onHide\s*\(\s*\)\s*\}[^>]*>[\s\n\r]*Close[\s\n\r]*<\s*\/\s*Button\s*>/i,
          ]),
      },
    ];

    addResult(tasks[4], required);
  }
}

/* -----------------------------
   Final scoring
-------------------------------- */
const stepsScore = results.reduce((sum, r) => sum + r.score, 0);
const totalScore = round2(stepsScore + submissionScore);

/* -----------------------------
   Build summary + feedback (same style)
-------------------------------- */
const LAB_NAME = "5-6-react-styling-fetch-data";

const submissionLine = `- **Lab:** ${LAB_NAME}
- **Deadline (Riyadh / UTC+03:00):** ${DEADLINE_RIYADH_ISO}
- **Last commit time (from git log):** ${lastCommitISO}
- **Submission marks:** **${submissionScore}/${SUBMISSION_MAX}** ${isLate ? "(Late submission)" : "(On time)"}
`;

let summary = `# ${LAB_NAME} — Autograding Summary

## Submission

${submissionLine}

## Files Checked

- Repo root (cwd): ${REPO_ROOT}
- Detected project root: ${PROJECT_ROOT}
- App: ${appFile ? `✅ ${appFile}` : "❌ App.jsx not found"}
- SearchBar: ${searchBarFile ? `✅ ${searchBarFile}` : "❌ SearchBar.jsx not found"}
- UserList: ${userListFile ? `✅ ${userListFile}` : "❌ UserList.jsx not found"}
- UserCard: ${userCardFile ? `✅ ${userCardFile}` : "❌ UserCard.jsx not found"}
- UserModal: ${userModalFile ? `✅ ${userModalFile}` : "❌ UserModal.jsx not found"}

## Marks Breakdown

| Component | Marks |
|---|---:|
`;

for (const r of results) summary += `| ${r.name} | ${r.score}/${r.max} |\n`;
summary += `| Submission (timing) | ${submissionScore}/${SUBMISSION_MAX} |\n`;

summary += `
## Total Marks

**${totalScore} / ${TOTAL_MAX}**

## Detailed Checks (What you did / missed)
`;

for (const r of results) {
  const done = (r.checklist || []).filter((x) => x.startsWith("✅"));
  const missed = (r.checklist || []).filter((x) => x.startsWith("❌"));

  summary += `
<details>
  <summary><strong>${mdEscape(r.name)}</strong> — ${r.score}/${r.max}</summary>

  <br/>

  <strong>✅ Found</strong>
  ${done.length ? "\n" + done.map((x) => `- ${mdEscape(x)}`).join("\n") : "\n- (Nothing detected)"}

  <br/><br/>

  <strong>❌ Missing</strong>
  ${missed.length ? "\n" + missed.map((x) => `- ${mdEscape(x)}`).join("\n") : "\n- (Nothing missing)"}

  <br/><br/>

  <strong>❗ Deductions / Notes</strong>
  ${
    r.deductions && r.deductions.length
      ? "\n" + r.deductions.map((d) => `- ${mdEscape(d)}`).join("\n")
      : "\n- No deductions."
  }

</details>
`;
}

summary += `
> Full feedback is also available in: \`artifacts/feedback/README.md\`
`;

let feedback = `# ${LAB_NAME} — Feedback

## Submission

${submissionLine}

## Files Checked

- Repo root (cwd): ${REPO_ROOT}
- Detected project root: ${PROJECT_ROOT}
- App: ${appFile ? `✅ ${appFile}` : "❌ App.jsx not found"}
- SearchBar: ${searchBarFile ? `✅ ${searchBarFile}` : "❌ SearchBar.jsx not found"}
- UserList: ${userListFile ? `✅ ${userListFile}` : "❌ UserList.jsx not found"}
- UserCard: ${userCardFile ? `✅ ${userCardFile}` : "❌ UserCard.jsx not found"}
- UserModal: ${userModalFile ? `✅ ${userModalFile}` : "❌ UserModal.jsx not found"}

---

## TODO-by-TODO Feedback
`;

for (const r of results) {
  feedback += `
### ${r.name} — **${r.score}/${r.max}**

**Checklist**
${r.checklist.length ? r.checklist.map((x) => `- ${x}`).join("\n") : "- (No checks available)"}

**Deductions / Notes**
${r.deductions.length ? r.deductions.map((d) => `- ❗ ${d}`).join("\n") : "- ✅ No deductions. Good job!"}
`;
}

feedback += `
---

## How marks were deducted (rules)

- JS/JSX comments are ignored (so starter TODO comments do NOT count).
- Checks are intentionally light: they look for key constructs and basic structure.
- Code can be in ANY order; repeated code is allowed.
- Common equivalents are accepted, and naming is flexible.
- Missing required items reduce marks proportionally within that TODO.
`;

/* -----------------------------
   Write outputs
-------------------------------- */
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);

const csv = `student,score,max_score
all_students,${totalScore},${TOTAL_MAX}
`;

fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
fs.writeFileSync(path.join(ARTIFACTS_DIR, "grade.csv"), csv);
fs.writeFileSync(path.join(FEEDBACK_DIR, "README.md"), feedback);

console.log(
  `✔ Lab graded: ${totalScore}/${TOTAL_MAX} (Submission: ${submissionScore}/${SUBMISSION_MAX}, TODOs: ${stepsScore}/${STEPS_MAX}).`
);
