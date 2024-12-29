const DeleteReplyUseCase = require('../DeleteReplyUseCase');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('DeleteReplyUseCase', () => {
  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const useCaseParams = {
      threadId: 'thread-3000',
      commentId: 'comment-5000',
      replyId: 'reply-80',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.verifyThreadAvailability = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentAvailability = jest.fn(() => Promise.resolve());
    mockReplyRepository.verifyReplyAvailability = jest.fn(() => Promise.resolve());
    mockReplyRepository.verifyReplyOwner = jest.fn(() => Promise.resolve());
    mockReplyRepository.deleteReplyById = jest.fn(() => Promise.resolve());

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await deleteReplyUseCase.execute('user-8080', useCaseParams);

    // Assert
    expect(mockThreadRepository.verifyThreadAvailability).toHaveBeenCalledWith(
      useCaseParams.threadId,
    );
    expect(mockCommentRepository.verifyCommentAvailability).toHaveBeenCalledWith(
      useCaseParams.commentId,
      useCaseParams.threadId,
    );
    expect(mockReplyRepository.verifyReplyAvailability).toHaveBeenCalledWith(
      useCaseParams.replyId,
      useCaseParams.commentId,
    );
    expect(mockReplyRepository.verifyReplyOwner).toHaveBeenCalledWith(
      useCaseParams.replyId,
      'user-8080',
    );
    expect(mockReplyRepository.deleteReplyById).toHaveBeenCalledWith(useCaseParams.replyId);
  });
});
