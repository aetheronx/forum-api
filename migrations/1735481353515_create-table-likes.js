/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    comment: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'comments',
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'users',
    },
  });

  pgm.addConstraint('likes', 'unique_comment_and_owner', 'UNIQUE(comment, owner)');
};

exports.down = (pgm) => {
  pgm.dropTable('likes');
};
