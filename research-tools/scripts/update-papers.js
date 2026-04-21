#!/usr/bin/env node
/**
 * update-papers.js  —  Paper Digest 自动更新脚本
 * ================================================
 *
 * 用法:
 *   node scripts/update-papers.js <file.json> [--push]        从文件读取并合并
 *   echo '[...]' | node scripts/update-papers.js --stdin       从 stdin 读取
 *   node scripts/update-papers.js --inline '[{...}]'           内联 JSON
 *   node scripts/update-papers.js --validate <file.json>       仅校验不写入
 *   node scripts/update-papers.js --stats                      查看数据统计
 *   node scripts/update-papers.js --dry-run <file.json>        模拟合并不写入
 *   node scripts/update-papers.js --backup <file.json>         合并前备份
 *   node scripts/update-papers.js --data-dir <path> <file.json>  指定 data 目录
 *
 * Cowork 集成:
 *   Cowork 每日定时任务 → 搜索论文 → 生成 JSON → 调用此脚本 → 自动推送 GitHub Pages
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ============================================================
// 配置
// ============================================================
const REQUIRED_FIELDS = ['id', 'date', 'title', 'authors', 'journal', 'field'];
const VALID_FIELDS = ['AI/ML', 'CV', 'NLP', 'Medical', 'Robotics', 'Security', 'VPP', 'Energy', 'Other'];

function getDataDir(args) {
    const idx = args.indexOf('--data-dir');
    if (idx !== -1 && args[idx + 1]) return path.resolve(args[idx + 1]);
    return path.join(__dirname, '..', 'data');
}

function getPapersPath(dataDir) {
    return path.join(dataDir, 'papers.json');
}

// ============================================================
// 颜色输出
// ============================================================
const C = {
    info: s => `\x1b[36m${s}\x1b[0m`,
    ok:   s => `\x1b[32m${s}\x1b[0m`,
    warn: s => `\x1b[33m${s}\x1b[0m`,
    err:  s => `\x1b[31m${s}\x1b[0m`,
    dim:  s => `\x1b[90m${s}\x1b[0m`,
};

// ============================================================
// stdin 读取
// ============================================================
function readStdin() {
    return new Promise((resolve, reject) => {
        let data = '';
        process.stdin.setEncoding('utf-8');
        process.stdin.on('data', chunk => { data += chunk; });
        process.stdin.on('end', () => resolve(data));
        process.stdin.on('error', reject);
        setTimeout(() => { if (!data) reject(new Error('Stdin timeout')); }, 30000);
    });
}

// ============================================================
// 统计模式
// ============================================================
function showStats(papers) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(C.info(`  papers.json 统计  (${papers.length} 篇)`));
    console.log(`${'='.repeat(50)}\n`);

    // 按日期
    const byDate = {};
    papers.forEach(p => { byDate[p.date] = (byDate[p.date] || 0) + 1; });
    console.log(C.info('按日期:'));
    Object.entries(byDate).sort().reverse().slice(0, 15).forEach(([d, n]) => {
        console.log(`  ${d}  ${'█'.repeat(n)} ${n}`);
    });

    // 按 field
    const byField = {};
    papers.forEach(p => { byField[p.field || 'N/A'] = (byField[p.field || 'N/A'] || 0) + 1; });
    console.log(C.info('\n按领域:'));
    Object.entries(byField).sort((a, b) => b[1] - a[1]).forEach(([f, n]) => {
        console.log(`  ${f.padEnd(12)} ${'█'.repeat(n)} ${n}`);
    });

    // 按 tags 频次 Top 15
    const tagCount = {};
    papers.forEach(p => (p.tags || []).forEach(t => { tagCount[t] = (tagCount[t] || 0) + 1; }));
    console.log(C.info('\n热门标签 Top 15:'));
    Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 15).forEach(([t, n]) => {
        console.log(`  ${t.padEnd(16)} ${'█'.repeat(n)} ${n}`);
    });

    // 技术维度（从 tags 推断）
    const hasTags = (p, keywords) => (p.tags || []).some(t => keywords.some(k => t.includes(k)));
    let fl = 0, kd = 0, mcu = 0, can = 0, lw = 0;
    papers.forEach(p => {
        if (hasTags(p, ['联邦学习', 'FL', 'Federated'])) fl++;
        if (hasTags(p, ['知识蒸馏', 'KD', 'Distill'])) kd++;
        if (hasTags(p, ['MCU', 'TinyML', 'ECU', '边缘部署', 'STM32', 'ESP32'])) mcu++;
        if (hasTags(p, ['CAN', 'CAN总线', '车载'])) can++;
        if (hasTags(p, ['轻量', 'lightweight', '超轻量'])) lw++;
    });
    console.log(C.info('\n技术维度:'));
    console.log(`  FL: ${fl} | KD: ${kd} | MCU/Edge: ${mcu} | CAN: ${can} | 轻量化: ${lw}`);

    // 五合一
    const fiveInOne = papers.filter(p =>
        hasTags(p, ['联邦学习', 'FL', 'Federated']) &&
        hasTags(p, ['知识蒸馏', 'KD', 'Distill']) &&
        hasTags(p, ['MCU', 'TinyML', 'ECU', '边缘部署']) &&
        hasTags(p, ['CAN', 'CAN总线']) &&
        hasTags(p, ['轻量', 'lightweight', '超轻量'])
    );
    console.log(C.ok(`\n  五合一 (FL + KD + MCU + CAN + 轻量): ${fiveInOne.length} 篇`));
    if (fiveInOne.length === 0) console.log(C.warn('  → 研究空白! 这正是你的发表机会'));

    console.log('');
}

// ============================================================
// 主流程
// ============================================================
async function main() {
    const args = process.argv.slice(2);
    const dataDir = getDataDir(args);
    const papersPath = getPapersPath(dataDir);
    const ROOT = path.join(__dirname, '..');

    const autoPush = args.includes('--push');
    const dryRun   = args.includes('--dry-run');
    const validateOnly = args.includes('--validate');
    const doBackup = args.includes('--backup');
    const useStdin = args.includes('--stdin');
    const inlineIdx = args.indexOf('--inline');

    // --stats
    if (args.includes('--stats')) {
        if (!fs.existsSync(papersPath)) { console.error('papers.json not found'); process.exit(1); }
        showStats(JSON.parse(fs.readFileSync(papersPath, 'utf-8')));
        return;
    }

    // --- 确定输入源 ---
    const skipArgs = new Set(['--push', '--dry-run', '--validate', '--backup', '--stdin']);
    let raw;
    if (useStdin) {
        console.log(C.dim('Reading from stdin...'));
        raw = await readStdin();
    } else if (inlineIdx !== -1 && args[inlineIdx + 1]) {
        raw = args[inlineIdx + 1];
    } else {
        const inputFile = args.find(a => !a.startsWith('--') && !skipArgs.has(a));
        if (!inputFile) {
            console.log(`
${C.info('Paper Digest Update Script')}

用法:
  node scripts/update-papers.js <file.json> [options]
  echo '[...]' | node scripts/update-papers.js --stdin [options]
  node scripts/update-papers.js --inline '[{...}]' [options]
  node scripts/update-papers.js --stats
  node scripts/update-papers.js --validate <file.json>

选项:
  --push       合并后自动 git add + commit + push
  --dry-run    模拟运行，显示结果但不写入文件
  --validate   仅校验 JSON 格式
  --backup     合并前备份 papers.json
  --data-dir   指定 data 目录 (默认: ./data)

Cowork 定时任务会每日自动调用此脚本。
`);
            process.exit(0);
        }
        if (!fs.existsSync(inputFile)) { console.error(C.err('File not found: ' + inputFile)); process.exit(1); }
        raw = fs.readFileSync(inputFile, 'utf-8');
    }

    // --- 提取 JSON（容错处理 markdown 包裹）---
    let jsonStr = raw.trim();
    const fenceMatch = jsonStr.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
    if (fenceMatch) jsonStr = fenceMatch[1].trim();
    const bracketStart = jsonStr.indexOf('[');
    const bracketEnd = jsonStr.lastIndexOf(']');
    if (bracketStart !== -1 && bracketEnd > bracketStart) {
        jsonStr = jsonStr.substring(bracketStart, bracketEnd + 1);
    }

    let newPapers;
    try {
        newPapers = JSON.parse(jsonStr);
        if (!Array.isArray(newPapers)) { console.error(C.err('Parsed data is not an array')); process.exit(1); }
    } catch (e) {
        console.error(C.err('JSON parse error: ' + e.message));
        console.error(C.dim('First 300 chars: ' + jsonStr.substring(0, 300)));
        process.exit(1);
    }

    // --- 校验 ---
    let allValid = true;
    const validPapers = newPapers.filter((p, i) => {
        const missing = REQUIRED_FIELDS.filter(k => !p[k]);
        if (missing.length > 0) {
            console.warn(C.warn(`  [SKIP #${i + 1}] Missing: ${missing.join(', ')} → ${p.title || p.id || '(unknown)'}`));
            allValid = false;
            return false;
        }
        if (p.field && !VALID_FIELDS.includes(p.field)) {
            console.warn(C.warn(`  [WARN #${i + 1}] Unknown field "${p.field}" → ${p.title}`));
        }
        if (p.highlights && !Array.isArray(p.highlights)) p.highlights = [p.highlights];
        if (p.tags && !Array.isArray(p.tags)) p.tags = [p.tags];
        // 去重 tags
        if (p.tags) p.tags = [...new Set(p.tags)];
        return true;
    });

    console.log(C.info(`校验: ${validPapers.length}/${newPapers.length} 通过`));

    if (validateOnly) {
        console.log(allValid ? C.ok('所有条目校验通过') : C.warn('部分条目被跳过'));
        return;
    }

    // --- 读取已有数据 ---
    let existing = [];
    if (fs.existsSync(papersPath)) {
        try { existing = JSON.parse(fs.readFileSync(papersPath, 'utf-8')); }
        catch (e) { console.warn(C.warn('Warning: papers.json 读取失败，从空数组开始')); }
    }

    // --- 备份 ---
    if (doBackup && fs.existsSync(papersPath)) {
        const backupDir = path.join(dataDir, '.backups');
        if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
        const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const dst = path.join(backupDir, `papers-${ts}.json`);
        fs.copyFileSync(papersPath, dst);
        console.log(C.dim(`备份: ${dst}`));
    }

    // --- 合并去重 ---
    const map = new Map(existing.map(p => [p.id, p]));
    let added = 0, updated = 0;

    validPapers.forEach(p => {
        if (!map.has(p.id)) {
            added++;
            console.log(C.ok(`  [+NEW] ${p.id}: ${p.title.substring(0, 55)}...`));
        } else {
            updated++;
            console.log(C.dim(`  [~UPD] ${p.id}`));
        }
        map.set(p.id, p);
    });

    // 按日期倒序，同日期按 id 排序
    const merged = Array.from(map.values()).sort((a, b) => {
        if (b.date !== a.date) return b.date.localeCompare(a.date);
        return a.id.localeCompare(b.id);
    });

    console.log(`\n${C.info('Result:')} +${added} new, ~${updated} updated, ${merged.length} total`);

    // --- dry-run ---
    if (dryRun) {
        console.log(C.warn('(dry-run: 未写入文件)'));
        return;
    }

    // --- 写入 ---
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(papersPath, JSON.stringify(merged, null, 2) + '\n', 'utf-8');
    console.log(C.ok(`已写入 ${papersPath}`));

    // --- 推送 ---
    if (autoPush && (added > 0 || updated > 0)) {
        try {
            const relPath = path.relative(ROOT, papersPath);
            execSync(`git add "${relPath}"`, { cwd: ROOT, stdio: 'pipe' });
            const today = new Date().toISOString().slice(0, 10);
            const msg = `Paper digest ${today}: +${added} new, ${updated} updated`;
            execSync(`git commit -m "${msg}"`, { cwd: ROOT, stdio: 'pipe' });
            execSync('git push', { cwd: ROOT, stdio: 'inherit' });
            console.log(C.ok('已推送到 GitHub Pages'));
        } catch (e) {
            if (e.stderr && e.stderr.toString().includes('nothing to commit')) {
                console.log(C.warn('没有变更需要提交'));
            } else {
                console.error(C.err('Git 操作失败: ' + e.message));
                process.exit(1);
            }
        }
    } else if (autoPush) {
        console.log(C.dim('没有变更需要推送'));
    }
}

main().catch(e => {
    console.error(C.err('Fatal: ' + e.message));
    process.exit(1);
});
