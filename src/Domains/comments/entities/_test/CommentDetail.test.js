const CommentDetail = require('../CommentDetail');

describe('CommentDetail entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-5000',
      username: 'joko',
    };

    // Action & Assert
    expect(() => new CommentDetail(payload)).toThrowError(
      'COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error when payload does not meet data type requirements', () => {
    // Arrange
    const payload = {
      id: 8080,
      username: 123,
      content: 'Just a few comments',
      replies: {},
      date: 50000000,
    };

    // Action & Assert
    expect(() => new CommentDetail(payload)).toThrowError(
      'COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should not throw error when date is a valid object', () => {
    const payload = {
      id: 'comment-5000',
      username: 'joko',
      content: 'Just a few comments',
      replies: [],
      date: new Date(),
    };

    expect(() => new CommentDetail(payload)).not.toThrow();
  });

  it('should create CommentDetail entities correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-5000',
      username: 'joko',
      content: 'Just a few comments',
      replies: [
        {
          id: 'replies-80',
          username: 'joko',
          content: 'Just a dummy reply',
          date: '2024-12-25T12:59:18.608942',
        },
      ],
      date: '2024-12-25T12:59:18.608942',
    };

    // Action
    const commentDetail = new CommentDetail(payload);

    // Assert
    expect(commentDetail).toBeInstanceOf(CommentDetail);
    expect(commentDetail.id).toEqual(payload.id);
    expect(commentDetail.username).toEqual(payload.username);
    expect(commentDetail.content).toEqual(payload.content);
    expect(commentDetail.replies).toEqual(payload.replies);
    expect(commentDetail.date).toEqual(payload.date);
  });

  it('should create deleted CommentDetail entities correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-5000',
      username: 'joko',
      content: 'Just a comment',
      replies: [
        {
          id: 'replies-80',
          username: 'joko',
          content: 'Just a dummy reply',
          date: '2024-12-25T12:59:18.608942',
        },
      ],
      date: '2024-12-25T12:59:18.608942',
      is_delete: true,
    };

    // Action
    const commentDetail = new CommentDetail(payload);

    // Assert
    expect(commentDetail).toBeInstanceOf(CommentDetail);
    expect(commentDetail.id).toEqual(payload.id);
    expect(commentDetail.username).toEqual(payload.username);
    expect(commentDetail.content).toEqual('**komentar telah dihapus**');
    expect(commentDetail.replies).toEqual(payload.replies);
    expect(commentDetail.date).toEqual(payload.date);
  });
});
