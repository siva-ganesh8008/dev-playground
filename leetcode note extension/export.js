/* global docx */
const logEl = document.getElementById('log');
const barEl = document.getElementById('bar');
const startBtn = document.getElementById('startBtn');
const onlyACEl = document.getElementById('onlyAC');

function log(msg, cls) {
  const line = document.createElement('div');
  if (cls) line.className = cls;
  line.textContent = msg;
  logEl.appendChild(line);
  logEl.scrollTop = logEl.scrollHeight;
}

function setProgress(done, total) {
  barEl.style.width = total ? `${Math.round((done / total) * 100)}%` : '0%';
}

async function gql(query, variables, operationName) {
  const res = await fetch('https://leetcode.com/graphql/', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables, operationName })
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

const DIFFICULTY_MAP = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };
const concurrencyEl = document.getElementById('concurrency');
const timerEl = document.getElementById('timer');

let timerStart = null;
let timerInterval = null;

function formatElapsed(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function startTimer() {
  timerStart = Date.now();
  timerEl.textContent = 'Elapsed: 0:00';
  timerInterval = setInterval(() => {
    timerEl.textContent = `Elapsed: ${formatElapsed(Date.now() - timerStart)}`;
  }, 1000);
}

function stopTimer(label) {
  clearInterval(timerInterval);
  timerInterval = null;
  if (timerStart) {
    timerEl.textContent = `${label}: ${formatElapsed(Date.now() - timerStart)}`;
  }
}

// Runs `worker` over `items` with at most `limit` running at once.
// Results come back in the same order as `items`, even though work
// finishes out of order.
async function runWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function runNext() {
    while (nextIndex < items.length) {
      const current = nextIndex++;
      results[current] = await worker(items[current], current);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, runNext);
  await Promise.all(workers);
  return results;
}

function getSelectedDifficulties() {
  return Array.from(document.querySelectorAll('.diff:checked')).map(el => el.value);
}

async function getSolvedList() {
  const res = await fetch('https://leetcode.com/api/problems/all/', { credentials: 'include' });
  if (!res.ok) throw new Error('Could not load problem list. Are you logged into leetcode.com?');
  const data = await res.json();
  const onlyAC = onlyACEl.checked;
  const selectedDifficulties = getSelectedDifficulties();
  return data.stat_status_pairs
    .filter(p => {
      if (onlyAC && p.status !== 'ac') return false;
      if (p.paid_only) return false;
      const difficulty = DIFFICULTY_MAP[p.difficulty && p.difficulty.level];
      if (!selectedDifficulties.includes(difficulty)) return false;
      return true;
    })
    .map(p => ({
      id: p.stat.frontend_question_id,
      title: p.stat.question__title,
      slug: p.stat.question__title_slug,
      difficulty: DIFFICULTY_MAP[p.difficulty && p.difficulty.level]
    }));
}

async function getQuestionContent(slug) {
  const query = `query questionData($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      questionFrontendId
      title
      titleSlug
      content
      difficulty
    }
  }`;
  const data = await gql(query, { titleSlug: slug }, 'questionData');
  return data.question;
}

async function getAcceptedSubmission(slug) {
  const query = `query questionSubmissionList($offset: Int!, $limit: Int!, $lastKey: String, $questionSlug: String!) {
    questionSubmissionList(offset: $offset, limit: $limit, lastKey: $lastKey, questionSlug: $questionSlug) {
      submissions { id statusDisplay lang timestamp }
    }
  }`;
  const data = await gql(query, { offset: 0, limit: 20, lastKey: null, questionSlug: slug }, 'questionSubmissionList');
  const subs = (data.questionSubmissionList && data.questionSubmissionList.submissions) || [];
  const accepted = subs.find(s => s.statusDisplay === 'Accepted');
  if (!accepted) return null;

  const detailQuery = `query submissionDetails($submissionId: Int!) {
    submissionDetails(submissionId: $submissionId) { code lang { name } }
  }`;
  const detailData = await gql(detailQuery, { submissionId: parseInt(accepted.id, 10) }, 'submissionDetails');
  const detail = detailData.submissionDetails;
  return detail ? { code: detail.code, lang: detail.lang.name } : null;
}

// Parse the problem's HTML content into a sequence of blocks: text / code / image
function parseContentHtml(html) {
  const parser = new DOMParser();
  const dom = parser.parseFromString(html, 'text/html');
  const blocks = [];

  function pushText(text) {
    const t = text.replace(/\u00a0/g, ' ').trim();
    if (t) blocks.push({ type: 'text', content: t });
  }

  function processNode(node) {
    if (node.nodeType === Node.TEXT_NODE) return;
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const tag = node.tagName;

    if (tag === 'IMG') {
      const src = node.getAttribute('src');
      if (src) blocks.push({ type: 'image', src });
      return;
    }
    if (tag === 'PRE') {
      blocks.push({ type: 'code', content: node.textContent });
      return;
    }
    if (tag === 'UL' || tag === 'OL') {
      node.querySelectorAll(':scope > li').forEach(li => pushText('• ' + li.textContent));
      return;
    }
    if (tag === 'P' || tag === 'DIV') {
      const hasNested = node.querySelector('img, p, div, ul, ol, pre');
      if (hasNested) {
        Array.from(node.childNodes).forEach(processNode);
      } else {
        pushText(node.textContent);
      }
      return;
    }
    Array.from(node.childNodes).forEach(processNode);
  }

  Array.from(dom.body.childNodes).forEach(processNode);
  return blocks;
}

function guessImageType(src, contentType) {
  const ct = (contentType || '').toLowerCase();
  if (ct.includes('jpeg') || ct.includes('jpg')) return 'jpg';
  if (ct.includes('gif')) return 'gif';
  if (ct.includes('bmp')) return 'bmp';
  if (ct.includes('png')) return 'png';

  const ext = (src.split('?')[0].split('.').pop() || '').toLowerCase();
  if (ext === 'jpg' || ext === 'jpeg') return 'jpg';
  if (ext === 'gif') return 'gif';
  if (ext === 'bmp') return 'bmp';
  return 'png'; // safe default; most LeetCode assets are png
}

async function imageBufferAndSize(src) {
  const res = await fetch(src);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching image`);
  const type = guessImageType(src, res.headers.get('content-type'));
  const buf = await res.arrayBuffer();
  const blob = new Blob([buf]);
  const url = URL.createObjectURL(blob);
  const dims = await new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => resolve({ w: 400, h: 300 });
    img.src = url;
  });
  URL.revokeObjectURL(url);
  const maxW = 500;
  const scale = dims.w > maxW ? maxW / dims.w : 1;
  return { buffer: buf, width: Math.round(dims.w * scale) || 400, height: Math.round(dims.h * scale) || 300, type };
}

async function blocksToDocxChildren(blocks) {
  const { Paragraph, TextRun, ImageRun } = docx;
  const children = [];
  for (const b of blocks) {
    if (b.type === 'text') {
      children.push(new Paragraph({ children: [new TextRun(b.content)], spacing: { after: 160 } }));
    } else if (b.type === 'code') {
      const lines = b.content.split('\n');
      for (const line of lines) {
        children.push(new Paragraph({
          children: [new TextRun({ text: line || ' ', font: 'Consolas', size: 18 })],
          spacing: { after: 20 }
        }));
      }
      children.push(new Paragraph({ text: '', spacing: { after: 120 } }));
    } else if (b.type === 'image') {
      try {
        const { buffer, width, height, type } = await imageBufferAndSize(b.src);
        children.push(new Paragraph({
          children: [new ImageRun({ data: buffer, transformation: { width, height }, type })],
          spacing: { after: 160 }
        }));
      } catch (e) {
        log(`  ! Image failed to embed (${b.src}): ${e.message}`, 'err');
        children.push(new Paragraph({ text: `[Image could not be loaded: ${b.src}]` }));
      }
    }
  }
  return children;
}

// Does all the fetching + block-building for a single problem.
// Independent per problem, so many of these can run at once.
async function buildProblemSection(p) {
  const { Paragraph, HeadingLevel, TextRun } = docx;

  let content;
  try {
    content = await getQuestionContent(p.slug);
  } catch (e) {
    log(`  ! Failed to fetch statement for ${p.id}. ${p.title}: ${e.message}`, 'err');
    return null;
  }

  const submission = await getAcceptedSubmission(p.slug).catch(e => {
    log(`  ! Failed to fetch submission for ${p.id}. ${p.title}: ${e.message}`, 'err');
    return null;
  });

  const children = [];
  children.push(new Paragraph({
    text: `${content.questionFrontendId}. ${content.title}  (${content.difficulty})`,
    heading: HeadingLevel.HEADING_1,
    spacing: { after: 200 }
  }));

  const blocks = parseContentHtml(content.content || '');
  children.push(...(await blocksToDocxChildren(blocks)));

  children.push(new Paragraph({
    text: submission ? `Submitted Code (${submission.lang})` : 'Submitted Code',
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 120 }
  }));

  if (submission) {
    submission.code.split('\n').forEach(line => {
      children.push(new Paragraph({
        children: [new TextRun({ text: line || ' ', font: 'Consolas', size: 18 })],
        spacing: { after: 20 }
      }));
    });
  } else {
    children.push(new Paragraph({ text: 'No accepted submission found for this problem.' }));
  }

  return { children, properties: { type: docx.SectionType.NEXT_PAGE } };
}

async function buildDocument(problems) {
  const { Document, Packer } = docx;
  const concurrency = parseInt(concurrencyEl.value, 10) || 1;
  let completed = 0;

  const sections = await runWithConcurrency(problems, concurrency, async (p) => {
    const section = await buildProblemSection(p);
    completed++;
    log(`(${completed}/${problems.length}) ${p.id}. ${p.title}`);
    setProgress(completed, problems.length);
    return section;
  });

  const doc = new Document({ sections: sections.filter(Boolean) });
  return Packer.toBlob(doc);
}

startBtn.addEventListener('click', async () => {
  startBtn.disabled = true;
  logEl.textContent = '';
  startTimer();
  try {
    if (getSelectedDifficulties().length === 0) {
      log('Select at least one difficulty (Easy/Medium/Hard) first.', 'err');
      stopTimer('Stopped after');
      startBtn.disabled = false;
      return;
    }
    log('Fetching your solved problems list…');
    const problems = await getSolvedList();
    log(`Found ${problems.length} problems. Starting export…`, 'ok');

    const blob = await buildDocument(problems);

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'LeetCode_Solutions.docx';
    document.body.appendChild(a);
    a.click();
    a.remove();

    stopTimer('Done in');
    log('Done! Your document has downloaded.', 'ok');
  } catch (e) {
    stopTimer('Stopped after');
    log(`Fatal error: ${e.message}`, 'err');
    console.error(e);
  } finally {
    startBtn.disabled = false;
  }
});
