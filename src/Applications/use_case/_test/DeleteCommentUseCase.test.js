const DeleteCommentUseCase = require('../DeleteCommentUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('DeleteCommentUseCase', () => {
  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const useCaseParams = {
      threadId: 'thread-3000',
      commentId: 'comment-5000',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.verifyThreadAvailability = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentAvailability = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentOwner = jest.fn(() => Promise.resolve());
    mockCommentRepository.deleteCommentById = jest.fn(() => Promise.resolve());

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await deleteCommentUseCase.execute('user-8080', useCaseParams);

    // Assert
    expect(mockThreadRepository.verifyThreadAvailability).toHaveBeenCalledWith(
      useCaseParams.threadId,
    );
    expect(mockCommentRepository.verifyCommentAvailability).toHaveBeenCalledWith(
      useCaseParams.commentId,
      useCaseParams.threadId,
    );
    expect(mockCommentRepository.verifyCommentOwner).toHaveBeenCalledWith(
      useCaseParams.commentId,
      'user-8080',
    );
    expect(mockCommentRepository.deleteCommentById).toHaveBeenCalledWith(useCaseParams.commentId);
  });
});
