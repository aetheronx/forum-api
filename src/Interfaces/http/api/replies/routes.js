const routes = (handler) => [
  {
    method: 'POST',
    path: '/threads/{threadId}/comments/{commentId}/replies',
    handler: (request, h) => handler.postReplyHandler(request, h),
    options: {
      auth: 'auth_token',
    },
  },
  {
    method: 'DELETE',
    path: '/threads/{threadId}/comments/{commentId}/replies/{replyId}',
    handler: (request) => handler.deleteReplyByIdHandler(request),
    options: {
      auth: 'auth_token',
    },
  },
];

module.exports = routes;
