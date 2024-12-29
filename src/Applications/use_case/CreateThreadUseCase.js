const CreateThread = require('../../Domains/threads/entities/CreateThread');

class CreateThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(userId, useCasePayload) {
    const createThread = new CreateThread(useCasePayload);
    return this._threadRepository.createThread(userId, createThread);
  }
}

module.exports = CreateThreadUseCase;
