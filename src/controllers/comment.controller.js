import mongoose, { mongo } from "mongoose";
import {Comment} from '../models/comment.model.js'
import {ApiError} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import {asyncHandler} from '../utils/asyncHandler.js'
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";


const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {page=1, limit=10} = req.query
    
    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video Id");
    }

    const user = await User.findOne({
        refresToken: req.cookies.refresToken
    })

    if(!user){
        throw new ApiError(404, "User not found")
    }

    const pageNumber = parseInt(page);
    const limitOfComments = parseInt(limit);

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404, "Video not found")
    }

    const comments = await Comment.aggregatePaginate(
        Comment.aggregate([
            {
                $match: {
                    video: video._id
                }
            },
            {
                $lookup: {
                    from:"likes",
                    localField: "_id",
                    foreignField:"comment",
                    as:"likes"
                }
            },
            {
                $addFields: {
                    likes: {
                        $size: "$likes"
                    },
                    isLiked: {
                        $in: [req.user?.id, "$likes.likedBy"]
                    },
                    username: {
                        $arrayElemAt:["$user.username", 0]
                    }
                }
            },
            {
                $project: {
                    username: 1, 
                    content: 1, 
                    likes: 1,
                    createdAt: 1,
                    isLiked: 1
                }
            },
            {
                $sort: {createdAt: -1}
            }
        ]),
        {page: pageNumber, limit: limitOfComments}
    );

    if(comments.length === 0){
        throw new ApiError(400, "No comments on the video")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, comments, "Comments fetched successfully"))
})

const addComment = asyncHandler(async(req, res) => {
    const {videoId} = req.params;

    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid Video Id")
    }

    const {content} = req.body
    if(!content){
        throw new ApiError(400, "Content is required")
    }

    const user = await User.findOne({
        refresToken: req.cookies.refreshToken
    })

    if(!user) {
        throw new ApiError(404, "User not found")
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(400, "Invalid video Id")
    }

    const comment = await Comment.create({
        content,
        owner: user._id,
        video: video._id
    })

    if(!comment){
        throw new ApiError(500, "Error in creating new comment")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, comment, "Comment Created successfully"))

})

const updateComment = asyncHandler(async(req, res) => {
    const {commentId} = req.params;

    if(!commentId){
        throw new ApiError(400, "Cannot find comment id")
    }

    const user = await User.findOne({
        refreshToken: req.cookies.refreshToken
    })

    if(!user){
        throw new ApiError(404, "User not found")
    }

    const {content} = req.body

    if(!content){
        throw new ApiError(400, "Content not found")
    }

    const comment = await Comment.findOneAndUpdate(
        {
            _id: commentId,
            owner: user._id,
        },
        {
            $set: {
                content
            }
        }, 
        {
            new: true
        }
    )

    if(!comment){
        throw new ApiError(400, "Only the owner can update the comment")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, comment, "Comment updated Successfully"))
})

const deleteComment = asyncHandler(async(req, res)=> {
    const {commentId} = req.params;

    if(!commentId){
        throw new ApiError(400, "Cannot find comment id")
    }

    const user = await User.findOne({
        refreshToken: req.cookies.refreshToken
    })

    if(!user){
        throw new ApiError(400, "User not found")
    }

    const deletedComment = await findOneAndDelete(
        {
            _id: commentId,
            owner: user._id
        }
    )

    if(!deletedComment){
        throw new ApiError(400, "Only the owner can delte the comment")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, deletedComment, "Comment Deleted Successfully"))

})

export{
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}