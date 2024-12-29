class CreatedReply {
  constructor(payload) {
    this._verifyPayload(payload);

    this.id = payload.id;
    this.content = payload.content;
    this.owner = payload.owner;
  }

  _verifyPayload({ id, content, owner }) {
    if (!id || !content || !owner) {
      throw new Error('CREATED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof content !== 'string' || typeof owner !== 'string') {
      throw new Error('CREATED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    if (!id.startsWith('reply-')) {
      throw new Error('CREATED_REPLY.INVALID_ID_FORMAT');
    }

    if (!owner.startsWith('user-')) {
      throw new Error('CREATED_REPLY.INVALID_OWNER_ID_FORMAT');
    }
  }
}

module.exports = CreatedReply;
