const ThreadDetailUseCase = require('../../../../Applications/use_case/ThreadDetailUseCase');
const CreateThreadUseCase = require('../../../../Applications/use_case/CreateThreadUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;
  }

  async postThreadHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const createThreadUseCase = this._container.getInstance(CreateThreadUseCase.name);
    const addedThread = await createThreadUseCase.execute(userId, request.payload);

    const response = h.response({
      status: 'success',
      data: {
        addedThread,
      },
    });
    response.code(201);
    return response;
  }

  async getThreadByIdHandler(request) {
    const { threadId } = request.params;
    const threadDetailUseCase = this._container.getInstance(ThreadDetailUseCase.name);
    const thread = await threadDetailUseCase.execute(threadId);

    return {
      status: 'success',
      data: {
        thread,
      },
    };
  }
}

module.exports = ThreadsHandler;
