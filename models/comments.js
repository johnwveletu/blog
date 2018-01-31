var Comment = require('../lib/mongo').Comment;
var marked = require('marked');

//将comment 的content 从markdown 转换成 html 这里我们为comment添加了一个插件
Comment.plugin('contentToHtml', {
    afterFind: function (comments) {
        return comments.map(function (comment) {
            comment.content = marked(comment.content);
            return comment;
        });
    }
});

module.exports = {
    //创建一个留言
    create: function create(comment) {
        return Comment.create(comment).exec();
    },
    //通过用户id和留言id删除一个留言
    delCommentById: function delCommentById(author, commentId) {
        return Comment.remove({
            author: author,
            _id: commentId
        }).exec();
    },
    //通过文章id删除该文章下的所有留言
    delCommentByPostId: function delCommentByPostId(postId) {
        return Comment.remove({
            postId: postId
        }).exec();
    },
    //通过文章id获取文章下的所有留言，按留言创建时间升序
    getComment: function getComment(postId) {
        return Comment.find({
                postId: postId
            })
            .populate({
                path: 'author',
                model: 'User'
            }) //此函数的作用是？？？？？？？？？？
            .sort({
                _id: 1
            })
            .addCreateAt()
            .contentToHtml()
            .exec();
    },
    // 通过文章 id 获取该文章下留言数
    getCommentsCount: function getCommentsCount(postId) {
        return Comment.count({
            postId: postId
        }).exec();
    }


};