import Database from 'better-sqlite3';

const db = new Database('./train-database.sqlite');

try {
  // Create uploaded_documents table
  db.exec(`
    CREATE TABLE IF NOT EXISTS uploaded_documents (
      document_id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_name TEXT NOT NULL,
      original_name TEXT NOT NULL,
      file_type TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      file_path TEXT NOT NULL,
      uploaded_by INTEGER NOT NULL REFERENCES train_users(user_id),
      processing_status TEXT NOT NULL DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
      error_message TEXT,
      records_processed INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
  `);

  // Create document_data_records table
  db.exec(`
    CREATE TABLE IF NOT EXISTS document_data_records (
      record_id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id INTEGER NOT NULL REFERENCES uploaded_documents(document_id),
      row_index INTEGER NOT NULL,
      column_data TEXT NOT NULL,
      data_type TEXT NOT NULL,
      is_valid INTEGER NOT NULL DEFAULT 1,
      validation_errors TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
  `);

  console.log('✅ Database tables created successfully!');
  
  // Verify tables were created
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%document%'").all();
  console.log('📋 Document tables:', tables.map(t => t.name));
  
} catch (error) {
  console.error('❌ Error creating tables:', error);
} finally {
  db.close();
}