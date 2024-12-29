const CreateCommentUseCase = require('../CreateCommentUseCase');
const CreateComment = require('../../../Domains/comments/entities/CreateComment');
const CreatedComment = require('../../../Domains/comments/entities/CreatedComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('CraeteCommentUseCase', () => {
  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = { content: 'Just a few comment' };

    const mockCreatedComment = new CreatedComment({
      id: 'comment-5000',
      content: 'Just a few comment',
      owner: 'user-8080',
    });

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.verifyThreadAvailability = jest.fn(() => Promise.resolve());
    mockCommentRepository.createComment = jest.fn(() => Promise.resolve(mockCreatedComment));

    const createCommentUseCase = new CreateCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const createdComment = await createCommentUseCase.execute(
      'user-8080',
      'thread-3000',
      useCasePayload,
    );

    // Assert
    expect(createdComment).toStrictEqual(
      new CreatedComment({
        id: 'comment-5000',
        content: 'Just a few comment',
        owner: 'user-8080',
      }),
    );

    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith('thread-3000');
    expect(mockCommentRepository.createComment).toBeCalledWith(
      'user-8080',
      'thread-3000',
      new CreateComment({ content: useCasePayload.content }),
    );
  });
});
