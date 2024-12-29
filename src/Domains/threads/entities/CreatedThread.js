class CreatedThread {
  constructor(payload) {
    this._verifyPayload(payload);

    this.id = payload.id;
    this.title = payload.title;
    this.owner = payload.owner;
  }

  _verifyPayload({ id, title, owner }) {
    if (!id || !title || !owner) {
      throw new Error('CREATED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof title !== 'string' || typeof owner !== 'string') {
      throw new Error('CREATED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    if (!id.startsWith('thread-')) {
      throw new Error('CREATED_THREAD.INVALID_ID_FORMAT');
    }
    if (!owner.startsWith('user-')) {
      throw new Error('CREATED_THREAD.INVALID_OWNER_ID_FORMAT');
    }
  }
}

module.exports = CreatedThread;
