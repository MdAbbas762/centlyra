const fs=require('fs'), path=require('path'), cp=require('child_process');
let ts; try {ts=require('typescript')} catch {ts=require(path.join(cp.execFileSync('npm',['root','-g'],{encoding:'utf8'}).trim(),'typescript'))}
const ROOT=path.resolve(__dirname,'..'), errors=[];let count=0;
function walk(p){for(const e of fs.readdirSync(p,{withFileTypes:true})){if(e.name==='node_modules'||e.name==='.next'||e.name==='.git')continue;const f=path.join(p,e.name);if(e.isDirectory())walk(f);else if(/\.(ts|tsx)$/.test(f)&&!f.includes('next-env')){
count++;const source=fs.readFileSync(f,'utf8'); const src=ts.createSourceFile(f,source,ts.ScriptTarget.Latest,true,f.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);for(const d of src.parseDiagnostics)errors.push(`${path.relative(ROOT,f)}: ${d.start} - ${ts.flattenDiagnosticMessageText(d.messageText,' ')}`);
for(const s of src.statements){if(ts.isImportDeclaration(s) && ts.isStringLiteral(s.moduleSpecifier)){const m=s.moduleSpecifier.text;if(m.startsWith('@/')||m.startsWith('./')||m.startsWith('../')){const b=m.startsWith('@/')?path.join(ROOT,m.slice(2)):path.resolve(path.dirname(f),m);if(![b,b+'.ts',b+'.tsx',b+'.json',path.join(b,'index.ts'),path.join(b,'index.tsx')].some(fs.existsSync))errors.push(`${path.relative(ROOT,f)}: unresolved import ${m}`)}}}
}}}
walk(ROOT);console.log('Checked',count,'TypeScript/TSX files');if(errors.length){console.error(errors.slice(0,80).join('\n'));process.exit(1)}console.log('Syntax and local imports verified');
