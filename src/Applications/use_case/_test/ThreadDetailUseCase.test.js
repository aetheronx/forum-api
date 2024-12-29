const ThreadDetailUseCase = require('../ThreadDetailUseCase');
const ThreadDetail = require('../../../Domains/threads/entities/ThreadDetail');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentDetail = require('../../../Domains/comments/entities/CommentDetail');
const ReplyDetail = require('../../../Domains/replies/entities/ReplyDetail');

describe('ThreadDetailUseCase', () => {
  it('should orchestrating the thread detail action correctly', async () => {
    // Arrange
    const mockThreadDetail = {
      id: 'thread-3000',
      title: 'My Thread Title',
      body: 'My thread body',
      date: '2024-12-25T12:59:18.608942',
      username: 'joko',
    };

    const mockComments = [
      {
        id: 'comment-5000',
        username: 'agus',
        date: '2024-12-25T12:59:18.608942',
        content: 'Just a few comments',
        is_delete: false,
      },
      {
        id: 'comment-5001',
        username: 'bagus',
        date: '2024-12-26T12:59:18.608942',
        content: 'Deleted comments',
        is_delete: true,
      },
    ];

    const mockReplies = [
      {
        id: 'reply-80',
        username: 'joko',
        date: '2024-12-27T12:59:18.608942',
        content: 'Just a dummy reply',
        comment: 'comment-5001',
        is_delete: false,
        owner: 'user-8080',
      },
      {
        id: 'reply-81',
        username: 'made',
        date: '2024-12-26T12:59:18.608942',
        content: 'Just a dummy reply',
        comment: 'comment-5000',
        is_delete: true,
        owner: 'user-8081',
      },
      {
        id: 'reply-82',
        username: 'ketut',
        date: '2024-12-26T12:59:18.608942',
        content: 'Just a dummy reply',
        comment: 'comment-5000',
        is_delete: false,
        owner: 'user-8082',
      },
    ];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.getThreadById = jest.fn(() => Promise.resolve(mockThreadDetail));
    mockCommentRepository.getCommentsByThreadId = jest.fn(() => Promise.resolve(mockComments));
    mockReplyRepository.getRepliesByThreadId = jest.fn(() => Promise.resolve(mockReplies));

    const threadDetailUseCase = new ThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const threadDetail = await threadDetailUseCase.execute('thread-3000');

    // Assert
    expect(threadDetail).toStrictEqual(
      new ThreadDetail({
        id: 'thread-3000',
        title: 'My Thread Title',
        body: 'My thread body',
        date: '2024-12-25T12:59:18.608942',
        username: 'joko',
        comments: [
          new CommentDetail({
            id: 'comment-5000',
            username: 'agus',
            date: '2024-12-25T12:59:18.608942',
            content: 'Just a few comments',
            is_delete: false,
            replies: [
              new ReplyDetail({
                id: 'reply-81',
                username: 'made',
                date: '2024-12-26T12:59:18.608942',
                content: '**balasan telah dihapus**',
                is_delete: true,
              }),
              new ReplyDetail({
                id: 'reply-82',
                username: 'ketut',
                content: 'Just a dummy reply',
                date: '2024-12-26T12:59:18.608942',
                is_delete: false,
              }),
            ],
          }),
          new CommentDetail({
            id: 'comment-5001',
            username: 'bagus',
            date: '2024-12-26T12:59:18.608942',
            content: '**komentar telah dihapus**',
            is_delete: true,
            replies: [],
          }),
        ],
      })
    );
    expect(mockThreadRepository.getThreadById).toBeCalledWith('thread-3000');
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith('thread-3000');
    expect(mockReplyRepository.getRepliesByThreadId).toBeCalledTimes(1);
    expect(mockReplyRepository.getRepliesByThreadId).toBeCalledWith('thread-3000');
  });
});
