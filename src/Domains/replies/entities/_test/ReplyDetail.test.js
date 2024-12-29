const ReplyDetail = require('../ReplyDetail');

describe('ReplyDetail entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      username: 'joko',
    };

    // Action & Assert
    expect(() => new ReplyDetail(payload)).toThrowError('REPLY_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type requirements', () => {
    // Arrange
    const payload = {
      id: {},
      username: 2024,
      content: 'Just a dummy reply',
      date: '2024-12-25',
    };

    // Action & Assert
    expect(() => new ReplyDetail(payload)).toThrowError(
      'REPLY_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should throw error when date is not a string or object', () => {
    const payload = {
      id: 'reply-80',
      username: 'Joko',
      content: 'Just a dummy reply',
      date: 12345, // Bukan string atau object
    };
    expect(() => new ReplyDetail(payload)).toThrowError(
      'REPLY_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should not throw error when date is a valid object', () => {
    const payload = {
      id: 'reply-80',
      username: 'Joko',
      content: 'Just a dummy reply',
      date: new Date(),
    };
    expect(() => new ReplyDetail(payload)).not.toThrow();
  });

  it('should create ReplyDetail entities correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-80',
      username: 'joko',
      content: 'Just a dummy reply',
      date: '2024-12-25T12:59:18.608942',
    };

    // Action
    const replyDetail = new ReplyDetail(payload);

    // Assert
    expect(replyDetail).toBeInstanceOf(ReplyDetail);
    expect(replyDetail.id).toEqual(payload.id);
    expect(replyDetail.username).toEqual(payload.username);
    expect(replyDetail.content).toEqual(payload.content);
    expect(replyDetail.date).toEqual(payload.date);
  });

  it('should create deleted ReplyDetail entities correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-80',
      username: 'joko',
      content: 'Just a dummy reply',
      date: '2024-12-25T12:59:18.608942',
      is_delete: true,
    };

    // Action
    const replyDetail = new ReplyDetail(payload);

    // Assert
    expect(replyDetail).toBeInstanceOf(ReplyDetail);
    expect(replyDetail.id).toEqual(payload.id);
    expect(replyDetail.username).toEqual(payload.username);
    expect(replyDetail.content).toEqual('**balasan telah dihapus**');
    expect(replyDetail.date).toEqual(payload.date);
  });
});
