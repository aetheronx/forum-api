/* eslint-disable camelcase */
class ReplyDetail {
  constructor(payload) {
    this._verifyPayload(payload);

    this.id = payload.id;
    this.username = payload.username;
    this.content = payload.is_delete ? '**balasan telah dihapus**' : payload.content;
    this.date = payload.date;
  }

  _verifyPayload({ id, username, content, date }) {
    if (!id || !username || !content || !date) {
      throw new Error('REPLY_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string' ||
      typeof username !== 'string' ||
      typeof content !== 'string' ||
      (typeof date !== 'string' && typeof date !== 'object')
    ) {
      throw new Error('REPLY_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = ReplyDetail;
