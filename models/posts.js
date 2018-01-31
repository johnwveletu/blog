var Post = require('../lib/mongo').Post;
var marked = require('marked');
var CommentModel = require('./comments');

//添加留言数量 添加一个插件 注意插件只有afterFind 和 afterFindOne
Post.plugin('addCommentsCount', {
    afterFind: function (posts) {
        return Promise.all(posts.map(function (post) {
            return CommentModel.getCommentsCount(post._id).then(function (commentCounts) {
                post.commentCounts = commentCounts;
                return post;
            });
        }));
    },
    afterFindOne: function (post) {
        if (post) {
            return CommentModel.getCommentsCount(post._id).then(function (count) {
                post.commentCounts = count;
                return post;
            });
        }
        return post;
    }
});
// 将 post 的 content 从 markdown 转换成 html
Post.plugin('contentToHtml', {
    afterFind: function (posts) {
        return posts.map(function (post) {
            post.content = marked(post.content);
            return post;
        });
    },
    afterFindOne: function (post) {
        if (post) {
            post.content = marked(post.content);
        }
        return post;
    }
});


module.exports = {
    //创建一篇文章
    create: function (post) {
        return Post.create(post).exec();
    },
    //通过文章id获取一篇文章
    getPostById: function (postId) {
        return Post.findOne({
                _id: postId
            })
            .populate({
                path: 'author',
                model: 'User'
            })
            .addCreateAt()
            .contentToHtml()
            .exec();
    },
    //按创建时间降序获取所有用户文章或者某个特定用户的文章
    getPosts: function (author) {
        var query = {};
        if (author) {
            query.author = author;
        }
        return Post.find(query)
            .populate({
                path: 'author',
                model: 'User'
            })
            .sort({
                _id: -1
            })
            .addCreateAt()
            .addCommentsCount()
            .contentToHtml()
            .exec();
    },
    incPv: function (postId) {
        return Post.update({
                _id: postId
            }, {
                $inc: {
                    pv: 1
                }
            })
            .exec();
    },
    getRawPostById: function (postId) {
        return Post.findOne({
                _id: postId
            })
            .populate({
                path: 'author',
                model: 'User'
            })
            .exec();
    },
    updatePostById: function (postId, author) {
        return Post.update({
                author: author,
                _id: postId
            }, {
                $set: {
                    data
                }
            })
            .exec();
    },
    delPostById: function (author, postId) {
        return Post.remove({
                author: author,
                _id: postId
            })
            .exec()
            .then(function (res) {
                //同时删除该文章下的留言
                if (res.result.ok && res.result.n > 0) {
                    return CommentModel.delCommentByPostId(postId);
                }
            })
    }
}