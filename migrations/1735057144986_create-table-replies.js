/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.createTable('replies', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    content: {
      type: 'TEXT',
      notNull: true,
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'users',
    },
    comment: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'comments',
    },
    date: {
      type: 'TIMESTAMP',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    is_delete: {
      type: 'boolean',
      notNull: false,
      default: false,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('replies');
};
