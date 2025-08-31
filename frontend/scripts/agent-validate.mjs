#!/usr/bin/env node
/*
Agent readiness validator
Checks:
- Canonical docs exist
- Storybook canonical pages exist (by file/meta title scan)
- Basic command liveness via package.json script presence and local bin existence
Exits 0 on success, 1 on failure, printing a summary.
*/
import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()

const FILES = {
  agentBoot: path.join(ROOT, 'docs', 'AGENT_BOOT.md'),
  devlog: path.join(ROOT, 'docs', 'status', 'DEVLOG.md'),
  epics: path.join(ROOT, 'docs', 'roadmap', 'EPICS.md'),
  systemStatus: path.join(ROOT, 'docs', 'SYSTEM_STATUS.md'),
  lastUpdated: path.join(ROOT, 'docs', 'status', 'last-updated.json'),
  sbAgentBoot: path.join(ROOT, 'src', 'stories', 'AgentBoot.docs.mdx'),
  sbDevlog: path.join(ROOT, 'src', 'stories', 'CommandCenterDevlog.docs.mdx'),
  sbEpicsManager: path.join(ROOT, 'src', 'stories', 'CommandCenterEpicsManager.docs.mdx'),
  sbSystemStatus: path.join(ROOT, 'src', 'stories', 'SystemStatus.docs.mdx'),
}

async function exists(p){ try { await fs.access(p); return true } catch { return false } }

async function validateFiles(){
  const checks = []
  for (const [k,p] of Object.entries(FILES)){
    checks.push({ name:k, path:p, ok: await exists(p) })
  }
  return checks
}

async function readJSON(p){ try { return JSON.parse(await fs.readFile(p,'utf8')) } catch { return null } }

async function validatePkg(){
  const pkg = await readJSON(path.join(ROOT,'package.json'))
  const s = pkg?.scripts || {}
  const requiredScripts = ['dev','storybook','test','test:e2e']
  const scripts = requiredScripts.map(n=>({ name:n, ok: !!s[n] }))

  // Check local bins exist
  const bins = ['jest','playwright','next','storybook'].map(n=>({ name:n, path: path.join(ROOT,'node_modules','.bin',n) }))
  for (const b of bins){ b.ok = await exists(b.path) }

  return { scripts, bins }
}

function summarize(checks, pkg){
  const fail = []
  const lines = []
  for (const c of checks){ lines.push(`${c.ok?'✅':'❌'} ${path.relative(ROOT,c.path)}`); if(!c.ok) fail.push(c) }
  lines.push('---')
  lines.push('Scripts:')
  for (const s of pkg.scripts){ lines.push(`${s.ok?'✅':'❌'} ${s.name}`); if(!s.ok) fail.push({ name:'script:'+s.name }) }
  lines.push('Bins:')
  for (const b of pkg.bins){ lines.push(`${b.ok?'✅':'❌'} node_modules/.bin/${b.name}`); if(!b.ok) fail.push({ name:'bin:'+b.name }) }
  return { text: lines.join('\n'), ok: fail.length===0 }
}

async function main(){
  const fileChecks = await validateFiles()
  const pkg = await validatePkg()
  const sum = summarize(fileChecks, pkg)
  console.log('[agent:validate] Summary')
  console.log(sum.text)
  if (!sum.ok){
    console.error('[agent:validate] FAIL')
    process.exit(1)
  }
  console.log('[agent:validate] OK')
}

main().catch(e=>{ console.error('[agent:validate] Error', e); process.exit(1) })

