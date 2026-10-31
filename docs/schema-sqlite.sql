PRAGMA foreign_keys = ON;
CREATE TABLE folders (
 id TEXT PRIMARY KEY, name TEXT NOT NULL CHECK(length(trim(name)) BETWEEN 1 AND 50), created_at INTEGER NOT NULL
);
CREATE TABLE files (
 id TEXT PRIMARY KEY, folder_id TEXT NOT NULL REFERENCES folders(id) ON DELETE RESTRICT,
 name TEXT NOT NULL CHECK(length(trim(name)) BETWEEN 1 AND 50), created_at INTEGER NOT NULL, UNIQUE(id,folder_id)
);
CREATE TABLE tasks (
 id TEXT PRIMARY KEY, folder_id TEXT NOT NULL REFERENCES folders(id) ON DELETE RESTRICT,
 file_id TEXT, name TEXT NOT NULL CHECK(length(trim(name)) BETWEEN 1 AND 100),
 priority INTEGER NOT NULL DEFAULT 3 CHECK(priority BETWEEN 0 AND 3),
 planned_minutes INTEGER CHECK(planned_minutes BETWEEN 1 AND 59999), due_date TEXT,
 memo TEXT NOT NULL DEFAULT '' CHECK(length(memo)<=500), done INTEGER NOT NULL DEFAULT 0 CHECK(done IN (0,1)),
 created_at INTEGER NOT NULL, completed_at INTEGER,
 FOREIGN KEY(file_id,folder_id) REFERENCES files(id,folder_id) ON DELETE RESTRICT,
 CHECK((done=0 AND completed_at IS NULL) OR (done=1 AND completed_at IS NOT NULL))
);
CREATE TABLE work_records (
 id TEXT PRIMARY KEY, task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE RESTRICT,
 duration_ms INTEGER NOT NULL CHECK(duration_ms>=1000), started_at INTEGER NOT NULL,
 ended_at INTEGER NOT NULL CHECK(ended_at>=started_at), memo TEXT NOT NULL DEFAULT '' CHECK(length(memo)<=500)
);
CREATE TABLE active_timer (
 slot INTEGER PRIMARY KEY CHECK(slot=1), id TEXT NOT NULL UNIQUE,
 task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE RESTRICT,
 elapsed_ms INTEGER NOT NULL DEFAULT 0 CHECK(elapsed_ms>=0), started_at INTEGER, first_started_at INTEGER NOT NULL
);
CREATE TABLE settings (
 id INTEGER PRIMARY KEY CHECK(id=1), sort_order TEXT NOT NULL DEFAULT 'priority' CHECK(sort_order IN ('priority','due','created')),
 show_done INTEGER NOT NULL DEFAULT 1 CHECK(show_done IN (0,1))
);
CREATE INDEX files_parent ON files(folder_id);
CREATE INDEX tasks_scope ON tasks(folder_id,file_id,done,priority);
CREATE INDEX records_task_date ON work_records(task_id,ended_at);
