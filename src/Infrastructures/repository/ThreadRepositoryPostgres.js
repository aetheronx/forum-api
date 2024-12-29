const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const CreatedThread = require('../../Domains/threads/entities/CreatedThread');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async verifyThreadAvailability(id) {
    const query = {
      text: 'SELECT id FROM threads WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('thread tidak dapat ditemukan di database');
    }
  }

  async createThread(userId, createThread) {
    const { title, body } = createThread;
    const id = `thread-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5) RETURNING id, title, owner',
      values: [id, title, body, userId, date],
    };

    const result = await this._pool.query(query);

    return new CreatedThread(result.rows[0]);
  }

  async getThreadById(id) {
    const query = {
      text: 'SELECT threads.id, threads.title, threads.body, threads.date::text, users.username FROM threads LEFT JOIN users ON users.id = threads.owner WHERE threads.id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('thread tidak dapat ditemukan di database');
    }

    return result.rows[0];
  }
}

module.exports = ThreadRepositoryPostgres;
