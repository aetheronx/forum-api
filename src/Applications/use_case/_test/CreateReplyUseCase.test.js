const CreateReplyUseCase = require('../CreateReplyUseCase');
const CreateReply = require('../../../Domains/replies/entities/CreateReply');
const CreatedReply = require('../../../Domains/replies/entities/CreatedReply');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('CreateReplyUseCase', () => {
  it('should orchestrating the create reply action correctly', async () => {
    // Arrange
    const useCaseParams = {
      threadId: 'thread-3000',
      commentId: 'comment-5000',
    };
    const useCasePayload = { content: 'Just a dummy reply' };

    const mockCreatedReply = new CreatedReply({
      id: 'reply-80',
      content: useCasePayload.content,
      owner: 'user-8080',
    });

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.verifyThreadAvailability = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentAvailability = jest.fn(() => Promise.resolve());
    mockReplyRepository.createReply = jest.fn(() => Promise.resolve(mockCreatedReply));

    const createReplyUseCase = new CreateReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const createdReply = await createReplyUseCase.execute(
      'user-8080',
      useCaseParams,
      useCasePayload,
    );

    // Assert
    expect(createdReply).toStrictEqual(
      new CreatedReply({
        id: 'reply-80',
        content: 'Just a dummy reply',
        owner: 'user-8080',
      }),
    );

    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith(useCaseParams.threadId);
    expect(mockCommentRepository.verifyCommentAvailability).toBeCalledWith(
      useCaseParams.commentId,
      useCaseParams.threadId,
    );
    expect(mockReplyRepository.createReply).toBeCalledWith(
      'user-8080',
      useCaseParams.commentId,
      new CreateReply({ content: useCasePayload.content }),
    );
  });
});
