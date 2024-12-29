const CreateComment = require('../../Domains/comments/entities/CreateComment');

class CreateCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(userId, threadId, useCasePayload) {
    await this._threadRepository.verifyThreadAvailability(threadId);
    const newCreateComment = new CreateComment(useCasePayload);
    return this._commentRepository.createComment(userId, threadId, newCreateComment);
  }
}

module.exports = CreateCommentUseCase;
