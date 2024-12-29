const CreateReply = require('../../Domains/replies/entities/CreateReply');

class CreateReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(userId, useCaseParams, useCasePayload) {
    const { threadId, commentId } = useCaseParams;
    await this._threadRepository.verifyThreadAvailability(threadId);
    await this._commentRepository.verifyCommentAvailability(commentId, threadId);

    const createReply = new CreateReply(useCasePayload);
    return this._replyRepository.createReply(userId, commentId, createReply);
  }
}

module.exports = CreateReplyUseCase;
