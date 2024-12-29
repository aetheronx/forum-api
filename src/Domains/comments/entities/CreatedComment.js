class CreatedComment {
  constructor(payload) {
    this._verifyPayload(payload);

    this.id = payload.id;
    this.content = payload.content;
    this.owner = payload.owner;
  }

  _verifyPayload({ content, owner, id }) {
    if (!id || !content || !owner) {
      throw new Error('CREATED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof content !== 'string' || typeof owner !== 'string') {
      throw new Error('CREATED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    if (!id.startsWith('comment-')) {
      throw new Error('CREATED_COMMENT.INVALID_ID_FORMAT');
    }

    if (!owner.startsWith('user-')) {
      throw new Error('CREATED_COMMENT.INVALID_OWNER_ID_FORMAT');
    }
  }
}

module.exports = CreatedComment;
