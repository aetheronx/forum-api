const routes = (handler) => [
  {
    method: 'POST',
    path: '/threads/{threadId}/comments',
    handler: (request, h) => handler.postCommentHandler(request, h),
    options: {
      auth: 'auth_token',
    },
  },
  {
    method: 'DELETE',
    path: '/threads/{threadId}/comments/{commentId}',
    handler: (request) => handler.deleteCommentByIdHandler(request),
    options: {
      auth: 'auth_token',
    },
  },
];

module.exports = routes;
