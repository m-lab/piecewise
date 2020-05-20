import { getLogger } from '../log.js';
const log = getLogger('backend:utils:updateTimestamp');

export const onUpdateTrigger = (client, table) => {
  if (client === 'pg') {
    // Wrap timestamp update trigger defined in first migration
    return `
      CREATE TRIGGER ${table}_updated_at
      BEFORE UPDATE ON ${table}
      FOR EACH ROW
      EXECUTE PROCEDURE on_update_timestamp();
    `;
  } else if (client === 'sqlite3') {
    return `
      CREATE TRIGGER ${table}_updated_at
      BEFORE UPDATE ON ${table}
      FOR EACH ROW
      WHEN NEW.updated_at < OLD.updated_at
      BEGIN
      UPDATE ${table} SET updated_at = CURRENT_TIMESTAMP WHERE id = old.id;
      END
    `;
  } else {
    log.error('No valid knex client defined.');
    return '';
  }
};
