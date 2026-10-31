import sqlite3
from pathlib import Path
con=sqlite3.connect(':memory:')
con.executescript(Path('docs/schema-sqlite.sql').read_text())
con.execute("INSERT INTO folders VALUES ('a','学校',1)")
con.execute("INSERT INTO folders VALUES ('b','暮らし',1)")
con.execute("INSERT INTO files VALUES ('x','a','英語',1)")
con.execute("INSERT INTO tasks(id,folder_id,file_id,name,created_at) VALUES ('t','a','x','単語',1)")
checks=[]
for label,sql in [
 ('所属フォルダの不一致を拒否',"INSERT INTO tasks(id,folder_id,file_id,name,created_at) VALUES ('bad','b','x','違反',1)"),
 ('空の名前を拒否',"INSERT INTO folders VALUES ('bad',' ',1)"),
 ('範囲外の優先度を拒否',"UPDATE tasks SET priority=4 WHERE id='t'"),
 ('関連データのある削除を拒否',"DELETE FROM folders WHERE id='a'"),
 ('存在しないToDoの記録を拒否',"INSERT INTO work_records VALUES ('r','none',1000,1,1001,'')")]:
 try:con.execute(sql)
 except sqlite3.IntegrityError:checks.append(label)
 else:raise AssertionError(label)
con.execute("INSERT INTO work_records VALUES ('r','t',1000,1,1001,'')")
try:con.execute("INSERT INTO work_records VALUES ('r','t',1000,1,1001,'')")
except sqlite3.IntegrityError:checks.append('記録IDの重複を拒否')
else:raise AssertionError('重複')
print('SQLite '+sqlite3.sqlite_version+'：DDL作成・正常登録・'+str(len(checks))+'件の制約検証に成功')
for c in checks:print('PASS '+c)
