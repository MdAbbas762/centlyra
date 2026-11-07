/** Small dependency-free runtime regression suite for the existing financial calculation layer.
 * Uses the project's TypeScript dev dependency to transpile pure finance modules in memory.
 * Run: npm run test:finance
 */
const fs = require('node:fs')
const path = require('node:path')
const cp = require('node:child_process')
const vm = require('node:vm')
const assert = require('node:assert/strict')
let ts
try { ts = require('typescript') } catch {
  const globalRoot = cp.execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim()
  ts = require(path.join(globalRoot, 'typescript'))
}
const root = path.resolve(__dirname, '..')
const cache = new Map()
function loadTs(file) {
  file = path.resolve(file)
  if (cache.has(file)) return cache.get(file).exports
  const module = { exports: {} }
  cache.set(file, module)
  const source = fs.readFileSync(file, 'utf8')
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: file,
    reportDiagnostics: true,
  })
  if (compiled.diagnostics?.length) throw new Error(compiled.diagnostics.map(d => ts.flattenDiagnosticMessageText(d.messageText,' ')).join('\n'))
  const localRequire = (specifier) => {
    if (!specifier.startsWith('.')) throw new Error(`Unexpected external dependency: ${specifier}`)
    return loadTs(path.resolve(path.dirname(file), specifier + '.ts'))
  }
  const fn = vm.runInThisContext(`(function(exports,require,module){${compiled.outputText}\n})`,{filename:file})
  fn(module.exports,localRequire,module)
  return module.exports
}
const { totalIncome, totalExpenses, netCashFlow, calculateBalance, spendingByCategory, calculateBudgetProgress, filterByMonth, monthlySeries } = loadTs(path.join(root, 'lib/finance/calculations.ts'))
const { applyTransactionFilters, DEFAULT_FILTERS } = loadTs(path.join(root, 'lib/finance/filtering.ts'))
const { createSampleData } = loadTs(path.join(root, 'lib/finance/seed.ts'))
const transactions = [
  { id:'a',date:'2026-11-02',type:'income',categoryId:'salary',amount:10000,description:'Pay',merchant:'Employer' },
  { id:'b',date:'2026-11-03',type:'expense',categoryId:'groceries',amount:2500,description:'Food',merchant:'Market' },
  { id:'c',date:'2026-11-05',type:'expense',categoryId:'groceries',amount:1000,description:'More food',merchant:'Market' },
  { id:'d',date:'2026-10-18',type:'expense',categoryId:'transport',amount:900,description:'Fare',merchant:'Transit' },
]
let passed = 0
function test(name, fn) { fn(); console.log('PASS',name);passed++ }
test('income and expense totals exclude opposite transaction types',()=>{
  assert.equal(totalIncome(transactions),10000)
  assert.equal(totalExpenses(transactions),4400)
  assert.equal(netCashFlow(transactions),5600)
})
test('balance respects starting amount, types and cutoff date',()=>{
  assert.equal(calculateBalance(3000,transactions),8600)
  assert.equal(calculateBalance(3000,transactions,'2026-11-02'),12100)
})
test('category totals count only expenses',()=>{
  const grouped=spendingByCategory(transactions)
  assert.equal(grouped.find(x=>x.categoryId==='groceries').amount,3500)
  assert.equal(grouped.find(x=>x.categoryId==='groceries').count,2)
  assert.equal(grouped.some(x=>x.categoryId==='salary'),false)
})
test('budgets follow transaction changes and flag overspending',()=>{
  const budget={id:'b',categoryId:'groceries',limit:3000}
  const current=filterByMonth(transactions,'2026-11')
  assert.equal(calculateBudgetProgress(budget,current).spent,3500)
  assert.equal(calculateBudgetProgress(budget,current).status,'over')
  const updated=current.filter(x=>x.id!=='c')
  assert.equal(calculateBudgetProgress(budget,updated).remaining,500)
  assert.equal(calculateBudgetProgress(budget,updated).status,'near')
})
test('month selection isolates months; series responds to transactions',()=>{
  assert.equal(filterByMonth(transactions,'2026-10').length,1)
  const series=monthlySeries(transactions,'2026-11',2)
  assert.equal(series[0].expenses,900)
  assert.equal(series[1].income,10000)
  assert.equal(series[1].expenses,3500)
})
test('transaction filters search and sort real records',()=>{
  const result=applyTransactionFilters(transactions,{...DEFAULT_FILTERS,query:'market',type:'expense',categoryId:'groceries',sort:'amount-desc'})
  assert.deepEqual(result.map(t=>t.id),['b','c'])
})
test('example data generation is deterministic for the same date',()=>{
  const a=createSampleData('2026-11-07'), b=createSampleData('2026-11-07')
  assert.deepEqual(a,b)
  assert.ok(a.transactions.length>0)
})
console.log(`\n${passed} finance regression checks passed.`)
