const { sequelize } = require('../models');

async function syncDatabase() {
  try {
    console.log('Synchronizing database models...');
    await sequelize.sync({ force: true });
    console.log('Database synchronization completed successfully!');

    // Query SQLite master table to confirm created tables
    const [tables] = await sequelize.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"
    );
    console.log('Tables created in database:', tables.map((t) => t.name));
  } catch (error) {
    console.error('Error synchronizing database:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

syncDatabase();
