/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const LikesTableTestHelper = {
  async addLike({ id = 'like-433', comment = 'comment-3000', owner = 'user-8080' }) {
    const query = {
      text: 'INSERT INTO likes (id, comment, owner) VALUES ($1, $2, $3)',
      values: [id, comment, owner],
    };

    await pool.query(query);
  },

  async findLikeById(likeId) {
    const query = {
      text: 'SELECT * FROM likes WHERE id = $1',
      values: [likeId],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async findLikeByCommentIdAndUserId(commentId, owner) {
    const query = {
      text: 'SELECT * FROM likes WHERE comment = $1 AND owner = $2',
      values: [commentId, owner],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM likes WHERE 1=1');
  },
};

module.exports = LikesTableTestHelper;
