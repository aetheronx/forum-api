const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const CreatedComment = require('../../Domains/comments/entities/CreatedComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async verifyCommentAvailability(commentId, threadId) {
    const query = {
      text: 'SELECT id, is_delete, thread FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('comment tidak dapat ditemukan di database');
    }

    if (result.rows[0].is_delete) {
      throw new NotFoundError('data comment tidak valid');
    }

    if (result.rows[0].thread !== threadId) {
      throw new NotFoundError('comment dalam thread tidak dapat ditemukan di database');
    }
  }

  async verifyCommentOwner(id, owner) {
    const query = {
      text: 'SELECT owner FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    const comment = result.rows[0];

    if (comment.owner !== owner) {
      throw new AuthorizationError('anda tidak memiliki akses');
    }
  }

  async createComment(userId, threadId, commentData) {
    const { content } = commentData;
    const id = `comment-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [id, content, userId, threadId, date],
    };

    const result = await this._pool.query(query);

    return new CreatedComment(result.rows[0]);
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: 'SELECT comments.id, users.username, comments.date, comments.content, comments.is_delete FROM comments LEFT JOIN users ON users.id = comments.owner WHERE comments.thread = $1 ORDER BY comments.date ASC',
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async deleteCommentById(id) {
    const query = {
      text: 'UPDATE comments SET is_delete = true WHERE id = $1',
      values: [id],
    };

    await this._pool.query(query);
  }
}

module.exports = CommentRepositoryPostgres;
