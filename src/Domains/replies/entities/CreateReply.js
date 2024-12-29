class CreateReply {
  constructor(payload) {
    this._verifyPayload(payload);

    this.content = payload.content;
  }

  _verifyPayload({ content }) {
    if (!content) {
      throw new Error('CREATE_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof content !== 'string') {
      throw new Error('CREATE_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = CreateReply;
